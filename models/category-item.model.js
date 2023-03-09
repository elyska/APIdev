const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');

const CategoryItem = sequelize.define("categoryItems", {
  ID: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('CategoryItem table created successfully!');
}).catch((error) => {
   console.error('Unable to create table CategoryItem: ', error);
});

module.exports = CategoryItem;