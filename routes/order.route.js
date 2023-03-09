const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const router = Router({prefix: '/api/v1/orders'})

router.get('/', getAll)

async function getAll(ctx) {
  let orders = ""
  ctx.body = orders
}

module.exports = router;