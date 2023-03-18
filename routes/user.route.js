
/**
 * A module that defines User routes.
 * @module routes/user
 */

require('dotenv').config()
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const auth = require('../controllers/auth');
const can = require('../permissions/users.permissions.js');

const model = require('../models/user.model.js');
const Token = require('../models/refresh-tokens.model.js');

const LoginHelper= require('../helpers/login-check.js');
const TokenHelper= require('../helpers/tokens.js');

const { validateUser, validateUserLogin } = require('../controllers/validation');

const prefix = '/api/v1/users';
const router = Router({prefix: prefix});

router.get('/', auth, getAll);
router.get('/:id([0-9]{1,})', auth, getById);
router.del('/:id([0-9]{1,})', auth, deleteUser);
router.post('/', bodyParser(), validateUser, createUser);

router.post('/login', bodyParser(), validateUserLogin, login); // validateUserLogin
router.post('/refresh', bodyParser(), refresh); 

/**
 * A function to login and create JWT tokens.
 * @param {object} ctx - The Koa request/response context object
 */
async function login(ctx) {
  const user = ctx.request.body;

  const loginSuccessful = await LoginHelper.verifyLoginDetails(user.email, user.password);

  // login failed
  if (!loginSuccessful) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/login`,
      register: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 400;
    ctx.body = { "message": "Incorrect email or password", "links": links };
    return;
  }

  // login successful
  var accessToken = TokenHelper.createAccessToken(user.email);
  var refreshToken = await TokenHelper.createRefreshToken(user.email);

  const id = await model.getByEmail(user.email);
  const links = {
    self: `${ctx.protocol}://${ctx.host}${prefix}/login`,
    details: `${ctx.protocol}://${ctx.host}${prefix}/${id.ID}`,
    delete: `${ctx.protocol}://${ctx.host}${prefix}/${id.ID}`
  };
  ctx.status = 200;
  ctx.body = { "accessToken": "Bearer " + accessToken, "refreshToken": refreshToken, "links": links };
}

/**
 * A function to refresh JWT tokens.
 * @param {object} ctx - The Koa request/response context object
 */
async function refresh(ctx) {
  const links = {
    self: `${ctx.protocol}://${ctx.host}${prefix}/refresh`,
    login: `${ctx.protocol}://${ctx.host}${prefix}/login`
  };
  const refreshToken = ctx.request.body.refreshToken;

  let payload;
  // verify if token validity
  jwt.verify(refreshToken, process.env.REFRESH_SECRET, function(err, decoded) {
    if (err) {
      ctx.status = 400;
      ctx.body = { "message": err.message, "links": links };
    }
    else {
      payload = decoded;
    }
  });
  if (!payload) return;

  // check if token is in the database
  const result = await Token.getToken(refreshToken, payload.email);
  console.log(result);
  // token not found in the database
  if (!result) {
    ctx.status = 404;
    ctx.body = { "message": "Token not found", "links": links };
    return;
  }
  // token found in the database
  // create new tokens and delete the old refresh token
  const newAccessToken = TokenHelper.createAccessToken(payload.email);
  const newRefreshToken = await TokenHelper.createRefreshToken(payload.email);
  const rowsAffected = await Token.deleteToken(refreshToken); // refresh token rotation
      
  ctx.status = 201;
  ctx.body = { "accessToken": "Bearer " + newAccessToken, "refreshToken": newRefreshToken, "links": links };
}

/**
 * A function to get all users.
 * @param {object} ctx - The Koa request/response context object
 */
async function getAll(ctx) {
  const user = ctx.state.user;
  const permission = can.readAll(user);

  if (permission.granted) {
    let users = await model.getAll();
    if (users.length) {
      const body = users.map(user => {
        const links = {
          self: `${ctx.protocol}://${ctx.host}${prefix}`,
          detail: `${ctx.protocol}://${ctx.host}${prefix}/${user.ID}`,
          delete: `${ctx.protocol}://${ctx.host}${prefix}/${user.ID}`
        };
        user.dataValues.links = links;
        return user;
      });
      users = body;
    }
    ctx.status = 200;
    ctx.body = users;
  }
  else {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}`,
      login: `${ctx.protocol}://${ctx.host}${prefix}/login`
    };
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to get a user by id.
 * @param {object} ctx - The Koa request/response context object
 */
async function getById(ctx) {
  const user = ctx.state.user;
  const id = ctx.params.id;

  const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        users: `${ctx.protocol}://${ctx.host}${prefix}`
  };

  const owner = await model.getById(id);
  if (!owner) {
    ctx.status = 404;
    ctx.body = { "message": "User does not exist", "links": links };
    return;
  }

  const permission = can.read(user, owner);

  if (permission.granted) {
    owner.dataValues.links = links;
    ctx.status = 200;
    ctx.body = permission.filter(owner).dataValues;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links }
  }
}

/**
 * A function to add a user.
 * @param {object} ctx - The Koa request/response context object
 */
async function createUser(ctx) {
  let user = ctx.request.body;
  try {
    let result = await model.createUser(user);
    const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}`,
        login: `${ctx.protocol}://${ctx.host}${prefix}/login`,
        details: `${ctx.protocol}://${ctx.host}${prefix}/${result.ID}`,
    };
    result.dataValues.links = links;
    ctx.status = 201;
    ctx.body = result;
  }
  catch(err) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}`,
      login: `${ctx.protocol}://${ctx.host}${prefix}/login`
    };
    ctx.status = 400;
    ctx.body = { "message": err.message, "links": links };
  }
}

/**
 * A function to delete a user.
 * @param {object} ctx - The Koa request/response context object
 */
async function deleteUser(ctx) {
  const user = ctx.state.user;
  const id = ctx.params.id;
  const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
      users: `${ctx.protocol}://${ctx.host}${prefix}`
  };

  const owner = await model.getById(id);
  if (!owner) {
    ctx.status = 404;
    ctx.body = { "message": "User does not exist", "links": links };
    return;
  }

  const permission = can.delete(user, owner);

  if (permission.granted) {
    let rowsAffected = await model.deleteUser(id);
    ctx.status = 200;
    ctx.body = { "message": `User ${id} deleted`, "links": links };
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links }
  }
}


/**
 * The User router
 */
module.exports = router;