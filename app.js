const Koa = require('koa');

const app = new Koa();

const user = require('./routes/user.route.js')
const product = require('./routes/product.route.js')
const order = require('./routes/order.route.js')
const category = require('./routes/category.route.js')

app.use(user.routes());
app.use(product.routes());
app.use(order.routes());
app.use(category.routes());
 
module.exports = app;