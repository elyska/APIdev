const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

require('dotenv').config()
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);

const Product = require('../models/product.model.js');
const Order = require('../models/order.model.js');
const OrderItem = require('../models/order-item.model.js');

const router = Router({prefix: '/api/v1/orders'});

router.get('/', getAll);
router.get('/:id([0-9]{1,})', getAllbyUserId);
router.post('/', bodyParser(), insertOrder);

router.post('/:id([0-9]{1,})/payment', bodyParser(), createPayment);
router.get('/success', paymentSuccess);
router.get('/cancel', paymentCancel);

async function createPayment(ctx) {
  const YOUR_DOMAIN = 'https://goodvertigo-chariotclarion-3000.codio-box.uk/api/v1/orders';
  const product = await stripe.products.create({
    name: 'Gold Special',
  });
  const price = await stripe.prices.create({
    currency: 'gbp',
    unit_amount: 10*100, // price in pence
    product: product.id,
  });
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: price.id,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  ctx.redirect(session.url); 
  
}

async function paymentSuccess(ctx) {
  ctx.body = { "message": "success" };
}

async function paymentCancel(ctx) {
  ctx.body = { "message": "cancel" };
}

async function getAll(ctx) {
  let orders = await Order.getAll();
  ctx.body = orders;
}

async function getAllbyUserId(ctx) {
  let id = ctx.params.id;
  let orders = await Order.getAllbyUserId(id);
  ctx.body = orders;
}

async function insertOrder(ctx) {
  let order = ctx.request.body;

  let result = await Order.insertOrder(order);
  let items = await OrderItem.insertOrderItems(order.products, result.ID);

  // add order items to result
  result.dataValues.products = items;
  ctx.body = result;
}

module.exports = router;