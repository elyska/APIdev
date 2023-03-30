
/**
 * A module that defines Category routes.
 * @module routes/category
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const auth = require('../controllers/auth');
const can = require('../permissions/categories.permissions.js');

const Category = require('../models/category.model.js');
const Product = require('../models/product.model.js');
const CategoryItem = require('../models/category-item.model.js');

const { validateCategory } = require('../controllers/validation');

const prefix = '/api/v1/categories';
const router = Router({prefix: prefix});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getCategoryProducts);
router.post('/', bodyParser(), auth, validateCategory, addCategory);
router.post('/:cid([0-9]{1,})/product/:pid([0-9]{1,})', auth, bodyParser(), addToCategory);
router.del('/:id([0-9]{1,})', auth, deleteCategory);
router.del('/:cid([0-9]{1,})/product/:pid([0-9]{1,})', auth, deleteFromCategory);

/**
 * A function to get all categories.
 * @param {object} ctx - The Koa request/response context object
 */
async function getAll(ctx) {
  let result = await Category.getAll();

  if (result.length) {
    const body = result.map(category => {
      const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}`,
        delete: `${ctx.protocol}://${ctx.host}${prefix}/${category.ID}`,
        add: `${ctx.protocol}://${ctx.host}${prefix}`,
        products: `${ctx.protocol}://${ctx.host}${prefix}/${category.ID}`
      };
      category.dataValues.links = links;
      return category;
    });

    ctx.status = 200;
    ctx.body = body;
  }
}

/**
 * A function to add a category.
 * @param {object} ctx - The Koa request/response context object
 */
async function addCategory(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.create(user);

  if (permission.granted) {
    // add category
    let category = ctx.request.body;
    let result = await Category.addCategory(category);
    
    const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}`,
        delete: `${ctx.protocol}://${ctx.host}${prefix}/${result.ID}`,
        products: `${ctx.protocol}://${ctx.host}${prefix}/${result.ID}`
    };
    result.dataValues.links = links;

    ctx.status = 201;
    ctx.body = result;
  }
  else {
    const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}`,
        categories: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to add a product to a category.
 * @param {object} ctx - The Koa request/response context object
 */
async function addToCategory(ctx) {
  let cid = ctx.params.cid;
  let pid = ctx.params.pid;
  const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}/${cid}/${pid}`,
        deleteCategory: `${ctx.protocol}://${ctx.host}${prefix}/${cid}`,
        deleteFromCategory: `${ctx.protocol}://${ctx.host}${prefix}/${cid}/product/${pid}`,
        categories: `${ctx.protocol}://${ctx.host}${prefix}`
  };
  // check permission
  const user = ctx.state.user;
  const permission = can.create(user);

  if (permission.granted) {
    // add to category
    try {
      let result = await CategoryItem.addToCategory(pid, cid);

      result.dataValues.links = links;

      ctx.status = 201;
      ctx.body = result;
    }
    catch(err)
    {
      ctx.status = 400;
      ctx.body = { "message": err.parent.sqlMessage, "links": links  };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to get all products in a category.
 * @param {object} ctx - The Koa request/response context object
 */
async function getCategoryProducts(ctx) {
  let id = ctx.params.id;
  let result = await Category.getCategoryProducts(id);
  
  if (result.length) {
    const body = result.map(item => {
      const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        deleteCategory: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        deleteFromCategory: `${ctx.protocol}://${ctx.host}${prefix}/${id}/product/${item.ID}`,
        categories: `${ctx.protocol}://${ctx.host}${prefix}`
      };
      item.dataValues.links = links;
      return item;
    });

    result = body;
  }
  ctx.status = 200;
  ctx.body = result;
}

/**
 * A function to delete a category.
 * @param {object} ctx - The Koa request/response context object
 */
async function deleteCategory(ctx) {
  let id = ctx.params.id;
  const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}/${id}`,
        add: `${ctx.protocol}://${ctx.host}${prefix}`,
        categories: `${ctx.protocol}://${ctx.host}${prefix}`
  };
  // check permission
  const user = ctx.state.user;
  const permission = can.delete(user);

  if (permission.granted) {
    // delete category

    let affectedRows = await Category.deleteById(id);
    if (affectedRows != 0) {

      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} category deleted`, "links": links };
    }
    else {
      ctx.status = 400;
      ctx.body =  { "message": `Category was not deleted`, "links": links };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to delete a product from a category.
 * @param {object} ctx - The Koa request/response context object
 */
async function deleteFromCategory(ctx) {
  let cid = ctx.params.cid;
  let pid = ctx.params.pid;
  const links = {
        self: `${ctx.protocol}://${ctx.host}${prefix}/${cid}/${pid}`,
        deleteCategory: `${ctx.protocol}://${ctx.host}${prefix}/${cid}`,
        addToCategory: `${ctx.protocol}://${ctx.host}${prefix}/${cid}/product/${pid}`,
        categories: `${ctx.protocol}://${ctx.host}${prefix}`
  };
  // check permission
  const user = ctx.state.user;
  const permission = can.delete(user);

  if (permission.granted) {
    // delete category
    let affectedRows = await CategoryItem.deleteFromCategory(pid, cid);
    if (affectedRows != 0) {
      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} product deleted from category ${cid}`, "links": links };
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
 * The Category router
 */
module.exports = router;