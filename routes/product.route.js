const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const auth = require('../controllers/auth');
const can = require('../permissions/products.permissions.js');

const model = require('../models/product.model.js');

const { validateProduct, validateProductUpdate } = require('../controllers/validation');

const router = Router({prefix: '/api/v1/products'});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', bodyParser(), auth, validateProduct, addProduct);
router.put('/:id([0-9]{1,})', bodyParser(), auth, validateProductUpdate, updateProduct);
router.del('/:id([0-9]{1,})', auth, deleteProduct);

async function getAll(ctx) {
  let products = await model.getAll();
  ctx.status = 200;
  ctx.body = products;
}

async function getById(ctx) {
  let id = ctx.params.id;

  let product = await model.getById(id);
  if (!product) {
    ctx.status = 404;
    ctx.body = { "message": "Product does not exist" };
    return;
  }

  ctx.status = 200;
  ctx.body = product;
}

async function addProduct(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.create(user);

  if (permission.granted) {
    // add product
    let product = ctx.request.body;
    let result = await model.addProduct(product);
    ctx.status = 201;
    ctx.body = result;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function updateProduct(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.update(user);

  if (permission.granted) {
    // update product
    const id = ctx.params.id;
    const product = ctx.request.body;

    const affectedRows = await model.updateById(id, product);
    if (affectedRows != 0) {
      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} product updated` };
    }
    else {
      ctx.status = 400;
      ctx.body =  { "message": `Product was not updated` };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function deleteProduct(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.delete(user);

  if (permission.granted) {
    // delete product
    const id = ctx.params.id;
    const product = ctx.request.body;

    const affectedRows = await model.deleteById(id);
    if (affectedRows != 0) {
      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} product deleted` };
    }
    else {
      ctx.status = 400;
      ctx.body =  { "message": `Product was not deleted` };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

module.exports = router;