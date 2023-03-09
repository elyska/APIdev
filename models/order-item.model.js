const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');

const OrderItem = sequelize.define("orderItems", {
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
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('OrderItem table created successfully!');
}).catch((error) => {
   console.error('Unable to create table OrderItem: ', error);
});

module.exports = OrderItem;