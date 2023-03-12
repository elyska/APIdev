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
  quantity: {
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

// insert order items
exports.insertOrderItems = async function insertOrderItems(items, orderId) {
  // add order id to items
  for (let i = 0; i < items.length; i++) {
    items[i].orderId = orderId;
  }
  // insert items
  let result = await OrderItem.bulkCreate(items);
  return result;
}

exports.OrderItem = OrderItem;