
/**
 * A module that defines Order routes.
 * @module routes/order
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const auth = require('../controllers/auth');
const can = require('../permissions/orders.permissions.js');

require('dotenv').config()
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);

const Product = require('../models/product.model.js');
const User = require('../models/user.model.js');
const Order = require('../models/order.model.js');
const OrderItem = require('../models/order-item.model.js');

const { validateOrder } = require('../controllers/validation');

const PaymentHelper= require('../helpers/payment.helper.js');

const prefix = '/api/v1/orders';
const router = Router({prefix: prefix});

router.get('/', auth, getAll);
router.get('/:id([0-9]{1,})', auth, getById);
router.get('/user/:id([0-9]{1,})', auth, getAllbyUserId);
router.post('/', bodyParser(), validateOrder, insertOrder);

router.post('/:id([0-9]{1,})/payment', bodyParser(), auth, createPayment);
router.get('/success', paymentSuccess);
router.get('/cancel', paymentCancel);
router.post('/:id([0-9]{1,})/payment-completed', bodyParser(), auth, paymentCompleted);

/**
 * A function to create a Stripe payment.
 * @param {object} ctx - The Koa request/response context object
 */
async function createPayment(ctx) { 
  // get order items
  let orderId = ctx.params.id;

  const user = ctx.state.user;
  let order = await Order.getById(orderId);
  // check if order exists
  if (!order) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment`,
      add: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 404;
    ctx.body = { "message": "Order not found", "links": links }; 
    return;
  }
  // check if order was paid
  if (order.paid) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment`,
      details: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}`
    };
    ctx.status = 400;
    ctx.body = { "message": "Order is already paid for", "links": links }; 
    return;
  }
  const owner = await User.getById(order.userId);

  const permission = can.pay(user, owner);

  // check permissions
  if (!permission.granted) { // user is not the owner of the order
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment`,
      details: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}`
    };
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links }
    return;
  }

  let lineItems = PaymentHelper.getLineItems(order.products);

  // payment
  // adapted from https://stripe.com/docs/checkout/quickstart?lang=node

  const YOUR_DOMAIN = 'https://goodvertigo-chariotclarion-3000.codio-box.uk/api/v1/orders';
  
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment`,
      complete: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment-completed`,
      details: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}`
  };
  ctx.status = 200;
  ctx.body = { "payment": session.url, "links": links }; 
}

/**
 * A function to complete a payment.
 * @param {object} ctx - The Koa request/response context object
 */
async function paymentCompleted(ctx) {
  let orderId = ctx.params.id;

  const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment-completed`,
      details: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}`
  };

  const user = ctx.state.user;
  let order = await Order.getById(orderId);
  // check if order exists
  if (!order) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment`,
      add: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 404;
    ctx.body = { "message": "Order not found", "links": links }; 
    return;
  }
  // check if order was paid
  if (order.paid) {
    ctx.status = 400;
    ctx.body = { "message": "Order is already paid for", "links": links }; 
    return;
  }
  const owner = await User.getById(order.userId);

  const permission = can.pay(user, owner);

  // check permissions
  if (permission.granted) { 
    let order = await Order.updatePaid(orderId);
    ctx.status = 201;
    ctx.body = { "message": "Payment completed", "links": links };
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links }
  }
}

/**
 * A function to show a success message after payment.
 * @param {object} ctx - The Koa request/response context object
 */
async function paymentSuccess(ctx) {
  ctx.status = 200;
  ctx.body = { "message": "success" };
}

/**
 * A function to show a payment was cancelled.
 * @param {object} ctx - The Koa request/response context object
 */
async function paymentCancel(ctx) {
  ctx.status = 400;
  ctx.body = { "message": "cancel" };
}

/**
 * A function to get all orders.
 * @param {object} ctx - The Koa request/response context object
 */
async function getAll(ctx) { // admin
  // check permission
  const user = ctx.state.user;
  const permission = can.readAll(user);

  if (permission.granted) {
    // delete product
    let orders = await Order.getAll();
    if (orders.length) {
      const body = orders.map(item => {
        const links = {
          self: `${ctx.protocol}://${ctx.host}${prefix}`,
          detail: `${ctx.protocol}://${ctx.host}${prefix}/${item.ID}`
        };
        item.dataValues.links = links;
        return item;
      });

      orders = body;
    }
    ctx.status = 200;
    ctx.body = orders;
  }
  else {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}`,
      add: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to get an order by order id.
 * @param {object} ctx - The Koa request/response context object
 */
async function getById(ctx) { // admin, user - owner
  // check permission
  const user = ctx.state.user;
  let orderId = ctx.params.id;

  let order = await Order.getById(orderId);
  // check if order exists
  if (!order) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}`,
      all: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 404;
    ctx.body = { "message": "Order not found", "links": links }; 
    return;
  }
  const owner = await User.getById(order.userId);

  const permission = can.read(user, owner);

  if (permission.granted) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}`,
      pay: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}/payment`,
      all: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    order.dataValues.links = links;
    ctx.status = 200;
    ctx.body = order;
  }
  else {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/${orderId}`,
      add: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to get an order by user id.
 * @param {object} ctx - The Koa request/response context object
 */
async function getAllbyUserId(ctx) { // admin, user - owner
  // check permission
  const user = ctx.state.user;
  let userId = ctx.params.id;

  const owner = await User.getById(userId);
  // check if user exists
  if (!owner) {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/user/${userId}`,
      all: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 404;
    ctx.body = { "message": "User not found", "links": links }; 
    return;
  }

  const permission = can.read(user, owner);

  if (permission.granted) {
    let orders = await Order.getAllbyUserId(userId);
    if (orders.length) {
      const body = orders.map(item => {
        const links = {
          self: `${ctx.protocol}://${ctx.host}${prefix}/user/${userId}`,
          detail: `${ctx.protocol}://${ctx.host}${prefix}/${item.ID}`,
          all: `${ctx.protocol}://${ctx.host}${prefix}`,
          pay: `${ctx.protocol}://${ctx.host}${prefix}/${item.ID}/payment`
        };
        item.dataValues.links = links;
        return item;
      });

      orders = body;
    }
    ctx.status = 200;
    ctx.body = orders;
  }
  else {
    const links = {
      self: `${ctx.protocol}://${ctx.host}${prefix}/user/${userId}`,
      add: `${ctx.protocol}://${ctx.host}${prefix}`
    };
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted", "links": links };
  }
}

/**
 * A function to add a new order.
 * @param {object} ctx - The Koa request/response context object
 */
async function insertOrder(ctx) {
  let order = ctx.request.body;

  let result = await Order.insertOrder(order);
  let items = await OrderItem.insertOrderItems(order.products, result.ID);

  // add order items to result
  result.dataValues.products = items;

  const links = {
    self: `${ctx.protocol}://${ctx.host}${prefix}`,
    pay: `${ctx.protocol}://${ctx.host}${prefix}/${result.ID}/payment`
  };
  result.dataValues.links = links;

  ctx.status = 201;
  ctx.body = result;
}

/**
 * The Order router
 */
module.exports = router;