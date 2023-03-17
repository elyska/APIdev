
/**
 * A module that defines Product routes.
 * @module routes/product
 */
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const auth = require('../controllers/auth');
const can = require('../permissions/products.permissions.js');

const model = require('../models/product.model.js');

const { validateProduct, validateProductUpdate } = require('../controllers/validation');

const prefix = '/api/v1/products'
const router = Router({prefix: prefix});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);
router.post('/', bodyParser(), auth, validateProduct, addProduct);
router.put('/:id([0-9]{1,})', bodyParser(), auth, validateProductUpdate, updateProduct);
router.del('/:id([0-9]{1,})', auth, deleteProduct);

/**
 * A function to get all products.
 * @param {object} ctx - The Koa request/response context object
 */
async function getAll(ctx) {
  let products = await model.getAll();

  if (products.length) {
    const body = products.map(product => {
      const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}`,
        detail: `${ctx.protocol}://${ctx.host}${prefix}/${product.ID}`,
        update: `${ctx.protocol}://${ctx.host}${prefix}/${product.ID}`,
        delete: `${ctx.protocol}://${ctx.host}${prefix}/${product.ID}`,
        add: `${ctx.protocol}://${ctx.host}${prefix}`
      };
      product.dataValues.links = links;
      return product;
    });

    ctx.status = 200;
    ctx.body = body;
  }
}

/**
 * A function to get a product by id.
 * @param {object} ctx - The Koa request/response context object
 */
async function getById(ctx) {
  let id = ctx.params.id;

  let product = await model.getById(id);
  if (!product) {
    ctx.status = 404;
    ctx.body = { "message": "Product does not exist" };
    return;
  }

  const links = {
    self: `${ctx.protocol}://${ctx.host}${prefix}/${product.ID}`,
    update: `${ctx.protocol}://${ctx.host}${prefix}/${product.ID}`,
    delete: `${ctx.protocol}://${ctx.host}${prefix}/${product.ID}`,
    add: `${ctx.protocol}://${ctx.host}${prefix}`
  };
  product.dataValues.links = links;

  ctx.status = 200;
  ctx.body = product;
}

/**
 * A function to add a product.
 * @param {object} ctx - The Koa request/response context object
 */
async function addProduct(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.create(user);

  if (permission.granted) {
    // add product
    let product = ctx.request.body;
    let result = await model.addProduct(product);

    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}`,
      detail: `${ctx.protocol}://${ctx.host}${prefix}/${result.ID}`,
      update: `${ctx.protocol}://${ctx.host}${prefix}/${result.ID}`,
      delete: `${ctx.protocol}://${ctx.host}${prefix}/${result.ID}`,
      allProducts: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    result.dataValues.links = links;

    ctx.status = 201;
    ctx.body = result;
  }
  else {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}`,
      allProducts: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to update a product by id.
 * @param {object} ctx - The Koa request/response context object
 */
async function updateProduct(ctx) {
  const id = ctx.params.id;
  // check permission
  const user = ctx.state.user;
  const permission = can.update(user);
  const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        detail: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        delete: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        allProducts: `${ctx.protocol}://${ctx.host}${prefix}`,
        add: `${ctx.protocol}://${ctx.host}${prefix}`
  };

  if (permission.granted) {
    // update product
    const product = ctx.request.body;

    const affectedRows = await model.updateById(id, product);
    if (affectedRows != 0) {
      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} product updated`, "links": links };
    }
    else {
      ctx.status = 400;
      ctx.body =  { "message": `Product was not updated`, "links": links  };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to delete a product by id.
 * @param {object} ctx - The Koa request/response context object
 */
async function deleteProduct(ctx) {
  const id = ctx.params.id;
  const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        detail: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        update: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        allProducts: `${ctx.protocol}://${ctx.host}${prefix}`,
        add: `${ctx.protocol}://${ctx.host}${prefix}`
  };
  // check permission
  const user = ctx.state.user;
  const permission = can.delete(user);

  if (permission.granted) {
    // delete product
    const product = ctx.request.body;

    const affectedRows = await model.deleteById(id);
    if (affectedRows != 0) {
      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} product deleted`, "links": links };
    }
    else {
      ctx.status = 400;
      ctx.body =  { "message": `Product was not deleted`, "links": links };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * The Product router
 */
module.exports = router;