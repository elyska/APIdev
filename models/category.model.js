const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');

const Category = sequelize.define("categories", {
  ID: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('Category table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Category: ', error);
});

module.exports = Category;