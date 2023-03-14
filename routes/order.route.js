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

const router = Router({prefix: '/api/v1/orders'});

router.get('/', auth, getAll);
router.get('/:id([0-9]{1,})', auth, getById);
router.get('/user/:id([0-9]{1,})', auth, getAllbyUserId);
router.post('/', bodyParser(), validateOrder, insertOrder);

router.post('/:id([0-9]{1,})/payment', bodyParser(), auth, createPayment);
router.get('/success', paymentSuccess);
router.get('/cancel', paymentCancel);
router.post('/:id([0-9]{1,})/payment-completed', bodyParser(), auth, paymentCompleted);

async function createPayment(ctx) { 
  // get order items
  let orderId = ctx.params.id;

  const user = ctx.state.user;
  let order = await Order.getById(orderId);
  // check if order exists
  if (!order) {
    ctx.status = 404;
    ctx.body = { "message": "Order not found" }; 
    return;
  }
  // check if order was paid
  if (order.paid) {
    ctx.status = 400;
    ctx.body = { "message": "Order is already paid for" }; 
    return;
  }
  const owner = await User.getById(order.userId);

  const permission = can.pay(user, owner);

  // check permissions
  if (!permission.granted) { // user is not the owner of the order
    ctx.status = 401;
    ctx.body = { "massage": "Permission not granted" }
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

  ctx.status = 200;
  ctx.body = { "payment": session.url }; 
}

async function paymentCompleted(ctx) {
  let orderId = ctx.params.id;

  const user = ctx.state.user;
  let order = await Order.getById(orderId);
  // check if order exists
  if (!order) {
    ctx.status = 404;
    ctx.body = { "message": "Order not found" }; 
    return;
  }
  // check if order was paid
  if (order.paid) {
    ctx.status = 400;
    ctx.body = { "message": "Order is already paid for" }; 
    return;
  }
  const owner = await User.getById(order.userId);

  const permission = can.pay(user, owner);

  // check permissions
  if (permission.granted) { 
    let order = await Order.updatePaid(orderId);
    ctx.status = 201;
    ctx.body = { "message": "Payment completed" };
  }
  else {
    ctx.status = 401;
    ctx.body = { "massage": "Permission not granted" }
  }
}

async function paymentSuccess(ctx) {
  ctx.status = 200;
  ctx.body = { "message": "success" };
}

async function paymentCancel(ctx) {
  ctx.status = 400;
  ctx.body = { "message": "cancel" };
}

async function getAll(ctx) { // admin
  // check permission
  const user = ctx.state.user;
  const permission = can.readAll(user);

  if (permission.granted) {
    // delete product
    let orders = await Order.getAll();
    ctx.status = 200;
    ctx.body = orders;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function getById(ctx) { // admin, user - owner
  // check permission
  const user = ctx.state.user;
  let orderId = ctx.params.id;

  let order = await Order.getById(orderId);
  // check if order exists
  if (!order) {
    ctx.status = 404;
    ctx.body = { "message": "Order not found" }; 
    return;
  }
  const owner = await User.getById(order.userId);

  const permission = can.read(user, owner);

  if (permission.granted) {
    ctx.status = 200;
    ctx.body = order;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function getAllbyUserId(ctx) { // admin, user - owner
  // check permission
  const user = ctx.state.user;
  let userId = ctx.params.id;

  const owner = await User.getById(userId);
  // check if user exists
  if (!owner) {
    ctx.status = 404;
    ctx.body = { "message": "User not found" }; 
    return;
  }

  const permission = can.read(user, owner);

  if (permission.granted) {
    let orders = await Order.getAllbyUserId(userId);
    ctx.status = 200;
    ctx.body = orders;
  }
  else {
    ctx.status = 401;
    ctx.body = { "message": "Permission not granted" };
  }
}

async function insertOrder(ctx) {
  let order = ctx.request.body;
  console.log(order)

  let result = await Order.insertOrder(order);
  let items = await OrderItem.insertOrderItems(order.products, result.ID);

  // add order items to result
  result.dataValues.products = items;

  ctx.status = 201;
  ctx.body = result;
}

module.exports = router;