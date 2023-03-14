
/**
 * A module that exports passport middleware for Koa.
 * @module controllers/auth
 */


const passport = require('koa-passport');
const jwtAuth = require('../strategies/jwt');

passport.use(jwtAuth);

module.exports = passport.authenticate(['jwt'], {session:false});