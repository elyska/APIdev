const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const auth = require('../controllers/auth');

const model = require('../models/user.model.js');

const LoginHelper= require('../helpers/login-check.js');

const { validateUser } = require('../controllers/validation');

const router = Router({prefix: '/api/v1/users'});

router.get('/', auth, getAll);
router.get('/:id([0-9]{1,})', getById);
router.del('/:id([0-9]{1,})', deleteUser);
router.post('/', bodyParser(), validateUser, createUser);

router.post('/login', bodyParser(), login); // validateUserLogin

async function login(ctx) {
  const user = ctx.request.body;

  const loginSuccessful = await LoginHelper.verifyLoginDetails(user.email, user.password);
  // login failed
  if (!loginSuccessful) {
    ctx.body = { "message": "Incorrect email or password" };
    return;
  }

  // login successful
  var token = jwt.sign({ email: user.email, iat: Math.floor(Date.now() / 1000) }, process.env.TOKEN_SECRET, { expiresIn: '10min' });

  ctx.body = { "token": "Bearer " + token };
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