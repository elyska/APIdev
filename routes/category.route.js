const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const auth = require('../controllers/auth');
const can = require('../permissions/categories.permissions.js');

const Category = require('../models/category.model.js');
const Product = require('../models/product.model.js');
const CategoryItem = require('../models/category-item.model.js');

const { validateCategory } = require('../controllers/validation');

const router = Router({prefix: '/api/v1/categories'});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getCategoryProducts);
router.post('/', bodyParser(), auth, validateCategory, addCategory);
router.post('/:cid([0-9]{1,})/product/:pid([0-9]{1,})', auth, bodyParser(), addToCategory);
router.del('/:id([0-9]{1,})', auth, deleteCategory);
router.del('/:cid([0-9]{1,})/product/:pid([0-9]{1,})', auth, deleteFromCategory);

async function getAll(ctx) {
  let result = await Category.getAll();
  ctx.status = 200;
  ctx.body = result;
}

async function addCategory(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.create(user);

  if (permission.granted) {
    // add category
    let category = ctx.request.body;
    let result = await Category.addCategory(category);
    ctx.status = 201;
    ctx.body = result;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function addToCategory(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.create(user);

  if (permission.granted) {
    // add to category
    let cid = ctx.params.cid;
    let pid = ctx.params.pid;
    try {
      let result = await CategoryItem.addToCategory(pid, cid);
      ctx.status = 201;
      ctx.body = result;
    }
    catch(err)
    {
      ctx.status = 400;
      ctx.body = { "message": err.parent.sqlMessage };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function getCategoryProducts(ctx) {
  let id = ctx.params.id;
  let result = await Category.getCategoryProducts(id);
  ctx.status = 200;
  ctx.body = result;
}

async function deleteCategory(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.delete(user);

  if (permission.granted) {
    // delete category
    let id = ctx.params.id;

    let affectedRows = await Category.deleteById(id);
    if (affectedRows != 0) {
      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} category deleted` };
    }
    else {
      ctx.status = 400;
      ctx.body =  { "message": `Category was not deleted` };
    }
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function deleteFromCategory(ctx) {
  // check permission
  const user = ctx.state.user;
  const permission = can.delete(user);

  if (permission.granted) {
    // delete category
    let cid = ctx.params.cid;
    let pid = ctx.params.pid;
    let affectedRows = await CategoryItem.deleteFromCategory(pid, cid);
    if (affectedRows != 0) {
      ctx.status = 200;
      ctx.body =  { "message": `${affectedRows} product deleted from category ${cid}` };
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