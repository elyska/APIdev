const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/category.model.js');

const router = Router({prefix: '/api/v1/categories'});

router.get('/', getAll);
router.post('/', bodyParser(), addCategory);
router.del('/:id([0-9]{1,})', deleteCategory);

async function getAll(ctx) {
  let result = await model.getAll();
  ctx.body = result;
}

async function addCategory(ctx) {
  let product = ctx.request.body;
  let result = await model.addProduct(product);
  ctx.body = result;
}

async function deleteCategory(ctx) {
  let id = ctx.params.id;

  let affectedRows = await model.deleteById(id);
  ctx.body = affectedRows;
}

module.exports = router;