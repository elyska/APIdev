const Koa = require('koa');

const app = new Koa();

const user = require('./routes/user.route.js')
const product = require('./routes/product.route.js')
const order = require('./routes/order.route.js')

app.use(user.routes());
app.use(product.routes());
app.use(order.routes());

let port = process.env.PORT || 3000;

app.listen(3000, () => console.log('Listening on port ' + port));