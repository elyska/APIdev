const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/product.model.js');

const { validateProduct } = require('../controllers/validation');

const router = Router({prefix: '/api/v1/products'});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', bodyParser(), validateProduct, addProduct);
router.put('/:id([0-9]{1,})', bodyParser(), updateProduct);
router.del('/:id([0-9]{1,})', deleteProduct);

async function getAll(ctx) {
  let products = await model.getAll();
  ctx.body = products;
}

async function getById(ctx) {
  let id = ctx.params.id;

  let products = await model.getById(id);
  ctx.body = products;
}

async function addProduct(ctx) {
  let product = ctx.request.body;
  let result = await model.addProduct(product);
  ctx.body = result;
}

async function updateProduct(ctx) {
  let id = ctx.params.id;
  const body = ctx.request.body;

  let affectedRows = await model.updateById(id, body);
  ctx.body = affectedRows;
}

async function deleteProduct(ctx) {
  let id = ctx.params.id;

  let affectedRows = await model.deleteById(id);
  ctx.body = affectedRows;
}

module.exports = router;