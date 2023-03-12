require('dotenv').config()
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const auth = require('../controllers/auth');

const model = require('../models/user.model.js');
const Token = require('../models/refresh-tokens.model.js');

const LoginHelper= require('../helpers/login-check.js');
const TokenHelper= require('../helpers/tokens.js');

const { validateUser } = require('../controllers/validation');

const router = Router({prefix: '/api/v1/users'});

router.get('/', auth, getAll);
router.get('/:id([0-9]{1,})', getById);
router.del('/:id([0-9]{1,})', deleteUser);
router.post('/', bodyParser(), validateUser, createUser);

router.post('/login', bodyParser(), login); // validateUserLogin
router.post('/refresh', bodyParser(), refresh); 

async function login(ctx) {
  const user = ctx.request.body;

  const loginSuccessful = await LoginHelper.verifyLoginDetails(user.email, user.password);

  // login failed
  if (!loginSuccessful) {
    ctx.body = { "message": "Incorrect email or password" };
    return;
  }

  // login successful
  var accessToken = TokenHelper.createAccessToken(user.email);
  var refreshToken = await TokenHelper.createRefreshToken(user.email);

  ctx.body = { "accessToken": "Bearer " + accessToken, "refreshToken": refreshToken };
}

async function refresh(ctx) {
  const refreshToken = ctx.request.body.refreshToken;

  let payload;
  // verify if token validity
  jwt.verify(refreshToken, process.env.REFRESH_SECRET, function(err, decoded) {
    if (err) {
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
    ctx.body = { "message": "Token not found" };
    return;
  }
  // token found in the database
  // create new tokens and delete the old refresh token
  const  newAccessToken = TokenHelper.createAccessToken(payload.email);
  const  newRefreshToken = await TokenHelper.createRefreshToken(payload.email);
  const rowsAffected = await Token.deleteToken(refreshToken); // refresh token rotation
      
  ctx.body = { "accessToken": "Bearer " + newAccessToken, "refreshToken": newRefreshToken };
}

async function getAll(ctx) {
  let users = await model.getAll();
  ctx.body = users;
}

async function getById(ctx) {
  let id = ctx.params.id;
  let user = await model.getById(id);
  ctx.body = user;
}

async function createUser(ctx) {
  let user = ctx.request.body;
  let users = await model.createUser(user);
  ctx.body = users;
}

async function deleteUser(ctx) {
  let id = ctx.params.id;
  let rowsAffected = await model.deleteUser(id);
  ctx.body = rowsAffected;
}

module.exports = router;