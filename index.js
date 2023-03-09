const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/api/v1', welcome);
app.use(router.routes());

function welcome(ctx, next) { 
  ctx.body = { message: "Welcome to the blog API!" } 
}

app.listen(3000);