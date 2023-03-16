
/**
 * An ORM module that defines the User model.
 * @module models/user
 */

const { Sequelize, DataTypes } = require("sequelize");

const bcrypt = require('bcrypt');
const saltRounds = 10;

const sequelize = require('../db');
const User = sequelize.define("users", {
  ID: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING(16),
    defaultValue: "user",
    allowNull: false
  }
}, { timestamps: false });
/*
sequelize.sync().then(() => {
   console.log('User table created successfully!');
}).catch((error) => {
   console.error('Unable to create table User: ', error);
});*/

/**
 * An object containing User details
 * @typedef {Object} User
 * @property {integer} ID - ID of the user
 * @property {string} name - The name of the user
 * @property {string} password - The hash of user's password
 * @property {string} email - The user's email
 * @property {string} role - The user's role
 */

/**
 * A function to get a user by email.
 * @param {string} email - The user's email
 * @returns {User} - User details
 */
exports.getByEmail = async function getByEmail(email) {
  let result = await User.findOne({
    where: {
      email: email
    }
  });
  return result;
}

/**
 * A function to get a user by id.
 * @param {integer} id - ID of the user
 * @returns {User} - User details
 */
exports.getById = async function getById(id) {
  let result = await User.findOne({
    where: {
      ID: id
    }
  });
  return result;
}

/**
 * An object containing User details without passwords
 * @typedef {Object} UserSecure
 * @property {integer} ID - ID of the user
 * @property {string} name - The name of the user
 * @property {string} email - The user's email
 * @property {string} role - The user's role
 */

/**
 * A function to get all users.
 * @returns {Array.<UserSecure>} - A list of all users without passwords
 */
exports.getAll = async function getAll() {
  let result = await User.findAll({
    attributes: ['ID', 'name', 'email', 'role']  // exclude password
  });
  return result;
}

/**
 * An object containing User details for creation
 * @typedef {Object} UserCreate
 * @property {string} name - The name of the user
 * @property {string} password - The user's password
 * @property {string} email - The user's email
 */

/**
 * A function to create a user.
 * @param {UserCreate} user - User details
 * @returns {Array.<User>} - Newly created user details
 */
exports.createUser = async function createUser(user) {
  // create password hash
  const hash = bcrypt.hashSync(user.password, saltRounds);
  user.password = hash;

  let result = await User.create(user);
  return result;
}

/**
 * A function to delete a user.
 * @param {integer} id - ID of the user
 * @returns {integer} - Number of rows affected
 */
exports.deleteUser = async function deleteUser(id) {
  let result = await User.destroy({
    where: {
      ID: id
    }
  });
  return result;
}

/**
 * The User model
 */
exports.User = User;