/**
  A module to create a Koa app and configure CORS.
  @module app
*/
const Koa = require('koa');
const cors = require('@koa/cors');

const user = require('./routes/user.route.js')
const product = require('./routes/product.route.js')
const order = require('./routes/order.route.js')
const category = require('./routes/category.route.js')

const app = new Koa();

app.use(cors({
  origin: 'https://goodvertigo-chariotclarion-3000.codio-box.uk',
  allowHeaders: ['Content-Type']
}));

app.use(user.routes());
app.use(product.routes());
app.use(order.routes());
app.use(category.routes());
 
module.exports = app;