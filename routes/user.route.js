const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const router = Router({prefix: '/api/v1/users'})

router.get('/', getAll)

async function getAll(ctx) {
  let users = ""
  ctx.body = users
}

module.exports = router;