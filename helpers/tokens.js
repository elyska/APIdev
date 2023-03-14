
/**
 * A module to create tokens for JWT athentication.
 * @module helpers/tokens
 */

require('dotenv').config()
const jwt = require('jsonwebtoken');
const Token = require('../models/refresh-tokens.model.js');

/**
 * A function that creates an access token.
 * @param {string} email - The user's email address
 * @returns {string} - The access token
 */
exports.createAccessToken = function createAccessToken(email) {
  const accessToken = jwt.sign({ email: email, iat: Math.floor(Date.now() / 1000) }, process.env.TOKEN_SECRET, { expiresIn: '10min' });
  return accessToken;
}

/**
 * A function that creates a refresh token.
 * @param {string} email - The user's email address
 * @returns {string} - The refresh token
 */
exports.createRefreshToken = async function createRefreshToken(email) {
  const refreshToken = jwt.sign({ email: email, iat: Math.floor(Date.now() / 1000) }, process.env.REFRESH_SECRET, { expiresIn: '3d' });
  const result = await Token.addToken(refreshToken, email);
  return refreshToken;
}