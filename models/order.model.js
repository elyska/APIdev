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
  }
}, { timestamps: true });

sequelize.sync().then(() => {
   console.log('Order table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Order: ', error);
});

// associations
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'productId' });
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'orderId' });


// get all orders
exports.getAll = async function getAll() {
  let result =  await Order.findAll({ 
    include: Product 
  });

  return result;
}

// get all orders of one user
exports.getAllbyUserId = async function getAllbyUserId(id) {
  let result =  await Order.findAll({ 
    where: {
      userId: id
    },
    include: Product 
  });

  return result;
}

// insert order
exports.insertOrder = async function insertOrder(order) {
  let result = await Order.create(order);
  return result;
}

exports.Order = Order;