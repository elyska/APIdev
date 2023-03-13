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

const router = Router({prefix: '/api/v1/users'});

router.get('/', auth, getAll);
router.get('/:id([0-9]{1,})', auth, getById);
router.del('/:id([0-9]{1,})', auth, deleteUser);
router.post('/', bodyParser(), validateUser, createUser);

router.post('/login', bodyParser(), validateUserLogin, login); // validateUserLogin
router.post('/refresh', bodyParser(), refresh); 

async function login(ctx) {
  const user = ctx.request.body;

  const loginSuccessful = await LoginHelper.verifyLoginDetails(user.email, user.password);

  // login failed
  if (!loginSuccessful) {
    ctx.status = 400;
    ctx.body = { "message": "Incorrect email or password" };
    return;
  }

  // login successful
  var accessToken = TokenHelper.createAccessToken(user.email);
  var refreshToken = await TokenHelper.createRefreshToken(user.email);

  ctx.status = 200;
  ctx.body = { "accessToken": "Bearer " + accessToken, "refreshToken": refreshToken };
}

async function refresh(ctx) {
  const refreshToken = ctx.request.body.refreshToken;

  let payload;
  // verify if token validity
  jwt.verify(refreshToken, process.env.REFRESH_SECRET, function(err, decoded) {
    if (err) {
      ctx.status = 400;
      ctx.body = { "message": err.message };
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
    ctx.body = { "message": "Token not found" };
    return;
  }
  // token found in the database
  // create new tokens and delete the old refresh token
  const newAccessToken = TokenHelper.createAccessToken(payload.email);
  const newRefreshToken = await TokenHelper.createRefreshToken(payload.email);
  const rowsAffected = await Token.deleteToken(refreshToken); // refresh token rotation
      
  ctx.status = 201;
  ctx.body = { "accessToken": "Bearer " + newAccessToken, "refreshToken": newRefreshToken };
}

async function getAll(ctx) {
  const user = ctx.state.user;
  const permission = can.readAll(user);

  if (permission.granted) {
    let users = await model.getAll();
    ctx.status = 200;
    ctx.body = users;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function getById(ctx) {
  const user = ctx.state.user;
  const id = ctx.params.id;
  const owner = await model.getById(id);
  if (!owner) {
    ctx.status = 404;
    ctx.body = { "message": "User does not exist" };
    return;
  }

  const permission = can.read(user, owner);

  if (permission.granted) {
    ctx.status = 200;
    ctx.body = permission.filter(owner).dataValues;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" }
  }
}

async function createUser(ctx) {
  let user = ctx.request.body;
  try {
    let result = await model.createUser(user);
    ctx.status = 201;
    ctx.body = result;
  }
  catch(err) {
    ctx.status = 400;
    ctx.body = { "message": err.message };
  }
}

async function deleteUser(ctx) {
  const user = ctx.state.user;
  const id = ctx.params.id;
  const owner = await model.getById(id);
  if (!owner) {
    ctx.status = 404;
    ctx.body = { "message": "User does not exist" };
    return;
  }

  const permission = can.delete(user, owner);

  if (permission.granted) {
    let rowsAffected = await model.deleteUser(id);
    ctx.status = 200;
    ctx.body = { "message": `User ${id} deleted` };
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" }
  }
}

module.exports = router;