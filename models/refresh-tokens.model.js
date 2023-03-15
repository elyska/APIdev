
/**
 * An ORM module that defines the Token model.
 * @module models/refresh-tokens
 */

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');

const Token = sequelize.define("tokens", {
  ID: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('Token table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Token: ', error);
});


/**
 * An object containing Token details
 * @typedef {Object} Token
 * @property {integer} ID - ID of the token
 * @property {string} token - The refresh token
 * @property {string} userEmail - The user's email
 */

/**
 * A function to add a refresh token.
 * @param {string} token - The refresh token
 * @param {string} email - The user's email
 * @returns {Token} - Newly created token details
 */
exports.addToken = async function addToken(token, email) {
  let result = await Token.create({ token: token, userEmail: email });
  return result;
}

/**
 * A function to get a refresh token.
 * @param {string} token - The refresh token
 * @returns {Token} - Token details
 */
exports.getToken = async function getToken(token) {
  let result =  await Token.findOne({ 
    where: {
      token: token
    }
  });
  
  return result;
}

/**
 * A function to delete a refresh token.
 * @param {string} token - The refresh token
 * @returns {integer} - Number of rows affected
 */
exports.deleteToken = async function deleteToken(token) {
  let result = await Token.destroy({
    where: {
      token: token
    }
  });
  return result;
}

/**
 * The Token model
 */
exports.Token = Token;