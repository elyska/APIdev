const passport = require('koa-passport');
const jwtAuth = require('../strategies/jwt');

passport.use(jwtAuth);

module.exports = passport.authenticate(['jwt'], {session:false});