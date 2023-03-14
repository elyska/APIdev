
/**
 * An ORM module that defines the OrderItem model.
 * @module models/order-item
 */

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

/**
 * An object containing Order Item details
 * @typedef {Object} OrderItem
 * @property {integer} ID - ID of the order item
 * @property {integer} productId - ID of the product
 * @property {integer} quantity - Quantity of the product
 * @property {integer} orderId - ID of the order
 */

/**
 * An object containing Order Item details for creation
 * @typedef {Object} CreateOrderItem
 * @property {integer} productId - ID of the product
 * @property {integer} quantity - Quantity of the product
 */

/**
 * A function to insert order items.
 * @param {Array.<CreateOrderItem>} items - Order items details
 * @param {integer} orderId - ID of the order
 * @returns {Array.<OrderItem>} - A list of newly created order items
 */
exports.insertOrderItems = async function insertOrderItems(items, orderId) {
  // add order id to items
  for (let i = 0; i < items.length; i++) {
    items[i].orderId = orderId;
  }
  // insert items
  let result = await OrderItem.bulkCreate(items);
  return result;
}

/**
 * The OrderItem model
 */
exports.OrderItem = OrderItem;