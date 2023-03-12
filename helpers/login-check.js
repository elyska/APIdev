
const bcrypt = require('bcrypt');

const model = require('../models/user.model.js');

// check login details
exports.verifyLoginDetails = async function verifyLoginDetails(email, password) {
  
  let user = await model.getByEmail(email);
  if (user) {
    return bcrypt.compareSync(password, user.password);
  }
  
  return false;
}
