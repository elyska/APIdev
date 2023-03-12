const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const Product = require('../models/product.model.js');
const Order = require('../models/order.model.js');
const OrderItem = require('../models/order-item.model.js');

require('dotenv').config()
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);


const router = Router({prefix: '/api/v1/orders'});