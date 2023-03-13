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
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(16),
    defaultValue: "user",
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('User table created successfully!');
}).catch((error) => {
   console.error('Unable to create table User: ', error);
});

// get user by email
exports.getByEmail = async function getByEmail(email) {
  let result = await User.findOne({
    where: {
      email: email
    }
  });
  return result;
}

// get user by id
exports.getById = async function getById(id) {
  let result = await User.findOne({
    where: {
      ID: id
    }
  });
  return result;
}

// get all users
exports.getAll = async function getAll() {
  let result = await User.findAll({
    attributes: ['ID', 'name', 'email', 'role']  // exclude password
  });
  return result;
}

// create user
exports.createUser = async function createUser(user) {
  // create password hash
  const hash = bcrypt.hashSync(user.password, saltRounds);
  user.password = hash;
  
  let result = await User.create(user);
  return result;
}

// delete user
exports.deleteUser = async function deleteUser(id) {
  let result = await User.destroy({
    where: {
      ID: id
    }
  });
  return result;
}

exports.User = User;