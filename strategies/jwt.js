
/**
 * A module to create JWT authentication strategy.
 * @module strategies/jwt
 */

require('dotenv').config()

const User = require('../models/user.model.js');

// adapted from http://www.passportjs.org/packages/passport-jwt/
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var opts = {}

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TOKEN_SECRET;

/**
 * The JWT authentication strategy object.
 * @param {object} opts - Object containing options to control how the token is extracted from the request or verified
 * @param {function(jwt_payload, done)} - Function to verify a user, (jwt_payload) is an object literal containing the decoded JWT payload, (done) is a passport error first callback accepting arguments done(error, user, info)
 */
const jwtStrategy = new JwtStrategy(opts, async function(jwt_payload, done) {
  
  // check if user exists
  const user = await User.getByEmail(jwt_payload.email); 

  if (!user) { // user not found
    return done(null, false);
  }
  else {
    return done(null, user);
  } 
});

/**
 * The JWT authentication strategy
 */
module.exports = jwtStrategy;