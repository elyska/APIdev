const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/user.model.js');

const router = Router({prefix: '/api/v1/users'});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.del('/:id([0-9]{1,})', deleteUser);
router.post('/', bodyParser(), createUser);

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