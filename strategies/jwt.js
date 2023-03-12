require('dotenv').config()

const User = require('../models/user.model.js');

// adapted from http://www.passportjs.org/packages/passport-jwt/
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var opts = {}

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TOKEN_SECRET;

const jwtStrategy = new JwtStrategy(opts, async function(jwt_payload, done) {
  console.log("jwt_payload");
  console.log(jwt_payload); //{ email: 'user1@user.com', iat: 1678643460, exp: 1678644060 }
  
  // check if user exists
  const user = await User.getByEmail(jwt_payload.email); 

  if (!user) { // user not found
    return done(err, false);
  }
  else {
    return done(null, user);
  } 
});

module.exports = jwtStrategy;