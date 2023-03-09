const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');
const Order = sequelize.define("orders", {
  ID: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: true });

sequelize.sync({ alter: true }).then(() => {
   console.log('Order table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Order: ', error);
});

module.exports = Order;