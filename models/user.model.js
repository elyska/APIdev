const { Sequelize, DataTypes } = require("sequelize");

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

sequelize.sync({ alter: true }).then(() => {
   console.log('User table created successfully!');
}).catch((error) => {
   console.error('Unable to create table User: ', error);
});

module.exports = User;