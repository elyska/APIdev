/**
 * A helper module for Login.
 * @module helpers/login-check
 */

const bcrypt = require('bcrypt');

const model = require('../models/user.model.js');

/**
 * A function to verify login details.
 * @param {string} email - The user's email address
 * @param {string} password - The hash of user's password
 * @returns {boolean} - The result of the verification
 */
exports.verifyLoginDetails = async function verifyLoginDetails(email, password) {
  
  let user = await model.getByEmail(email);
  if (user) {
    return bcrypt.compareSync(password, user.password);
  }
  
  return false;
}
