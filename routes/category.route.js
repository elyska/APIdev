const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const Category = require('../models/category.model.js');
const Product = require('../models/product.model.js');
const CategoryItem = require('../models/category-item.model.js');

const router = Router({prefix: '/api/v1/categories'});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getCategoryProducts);
router.post('/', bodyParser(), addCategory);
router.post('/:cid([0-9]{1,})/product/:pid([0-9]{1,})', bodyParser(), addToCategory);
router.del('/:id([0-9]{1,})', deleteCategory);
router.del('/:cid([0-9]{1,})/product/:pid([0-9]{1,})', deleteFromCategory);

async function getAll(ctx) {
  let result = await Category.getAll();
  ctx.body = result;
}

async function addCategory(ctx) {
  let product = ctx.request.body;
  let result = await Category.addCategory(product);
  ctx.body = result;
}

async function addToCategory(ctx) {
  let cid = ctx.params.cid;
  let pid = ctx.params.pid;
  let result = await CategoryItem.addToCategory(pid, cid);
  ctx.body = result;
}

async function getCategoryProducts(ctx) {
  let id = ctx.params.id;
  let result = await Category.getCategoryProducts(id);
  ctx.body = result;
}

async function deleteCategory(ctx) {
  let id = ctx.params.id;

  let affectedRows = await Category.deleteById(id);
  ctx.body = affectedRows;
}

async function deleteFromCategory(ctx) {
  let cid = ctx.params.cid;
  let pid = ctx.params.pid;
  let affectedRows = await CategoryItem.deleteFromCategory(pid, cid);
  ctx.body = affectedRows;
}

module.exports = router;