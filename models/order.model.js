
/**
 * An ORM module that defines the Order model.
 * @module models/order
 */

const { Sequelize, DataTypes } = require("sequelize");

const Product = require('./product.model.js').Product;
const OrderItem = require('./order-item.model.js').OrderItem;
const OrderItemModel = require('./order-item.model.js');

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
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, { timestamps: true });
/*
sequelize.sync().then(() => {
   console.log('Order table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Order: ', error);
});*/

// associations
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'productId' });
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'orderId' });

/**
 * An object containing Order Item details
 * @typedef {Object} OrderItem
 * @property {integer} ID - ID of the order item
 * @property {integer} productId - ID of the product
 * @property {integer} quantity - Quantity of the product
 * @property {integer} orderId - ID of the order
 */

/**
 * An object containing product details
 * @typedef {Object} Product
 * @property {integer} ID - ID of the product
 * @property {string} title - name of the product
 * @property {integer} price - price of the product
 * @property {string} description - multiline description of the product
 * @property {string} image - URL of the product image
 * @property {Array.<OrderItem>} orderItems - A list of order items
 */

/**
 * An object containing Order details
 * @typedef {Object} Order
 * @property {integer} ID - ID of the order
 * @property {integer} userId - ID of the user
 * @property {string} address - The delivery address
 * @property {boolean} paid - The payment status of the order
 * @property {string} createdAt - The date of the order creation
 * @property {string} updatedAt - The date of the order update
 * @property {Array.<Product>} products - A list of the ordered product
 */

/**
 * A function to get all orders with product details.
 * @returns {Array.<Order>} - A list of all orders
 */
exports.getAll = async function getAll() {
  let result =  await Order.findAll({ 
    include: Product 
  });

  return result;
}

/**
 * A function to get an order by id.
 * @param {integer} id - ID of the order
 * @returns {Order} - Order details
 */
exports.getById = async function getById(id) {
  let result =  await Order.findOne({ 
    where: {
      ID: id
    },
    include: Product 
  });

  return result;
}

/**
 * A function to get all orders of one user.
 * @param {integer} id - ID of the user
 * @returns {Array.<Order>} - A list of all orders of one user
 */
exports.getAllbyUserId = async function getAllbyUserId(id) {
  let result =  await Order.findAll({ 
    where: {
      userId: id
    },
    include: Product 
  });

  return result;
}

/**
 * An object containing Order Item details for creation
 * @typedef {Object} OrderItemInsert
 * @property {integer} productId - ID of the product
 * @property {integer} quantity - Quantity of the product
 */

/**
 * An object containing Order details for creation
 * @typedef {Object} OrderInsert
 * @property {integer} userId - ID of the user
 * @property {string} address - The delivery address
 * @property {Array.<OrderItemInsert>} products - A list of the ordered product
 */

/**
 * An object containing Order details without order items
 * @typedef {Object} CreatedOrder
 * @property {integer} ID - ID of the order
 * @property {integer} userId - ID of the user
 * @property {string} address - The delivery address
 * @property {boolean} paid - The payment status of the order
 * @property {string} createdAt - The date of the order creation
 * @property {string} updatedAt - The date of the order update
 */

/**
 * A function to insert an order.
 * @param {OrderInsert} order - Order details for creation
 * @returns {Array.<CreatedOrder>} - Newly created order details
 */
exports.insertOrder = async function insertOrder(order) {
  let result = await Order.create(order);
  return result;
}

/**
 * A function to update payment status of an order.
 * @param {integer} id - ID of the order
 * @returns {Object} - Number of rows affected
 */
exports.updatePaid = async function updatePaid(id) {
  let result = await Order.update({ paid: true }, {
    where: {
      ID: id
    }
  });
  return result;
}

/**
 * The Order model
 */
exports.Order = Order;