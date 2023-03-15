const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');

const Product = sequelize.define("products", {
  ID: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('Product table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Product: ', error);
});

/**
 * An object containing product details
 * @typedef {Object} Product
 * @property {integer} ID - ID of the product
 * @property {string} title - Name of the product
 * @property {integer} price - Price of the product
 * @property {string} description - Multiline description of the product
 * @property {string} image - URL of the product image
 */

/**
 * A function to get all products.
 * @returns {Array.<Product>} - A list of all products
 */
exports.getAll = async function getAll() {
  let result = await Product.findAll();
  return result;
}

/**
 * A function to get a product by id.
 * @param {integer} id - ID of the product
 * @returns {Product} - Product details
 */
exports.getById = async function getById(id) {
  let result = await Product.findOne({
    where: {
      ID: id
    }
  });
  return result;
}

/**
 * An object containing product details for creation
 * @typedef {Object} ProductCreate
 * @property {string} title - Name of the product
 * @property {integer} price - Price of the product
 * @property {string} description - Multiline description of the product
 * @property {string} image - URL of the product image
 */

/**
 * A function to add a product.
 * @param {ProductCreate} product - Product details for creation
 * @returns {Product} - Newly created product details
 */
exports.addProduct = async function addProduct(product) {
  let result = await Product.create(product);
  return result;
}

/**
 * A function to update a product by id.
 * @param {integer} id - ID of the product
 * @param {ProductCreate} product - Product details for update
 * @returns {Object} - Number of rows affected
 */
exports.updateById = async function updateById(id, product) {
  let result = await Product.update(product, {
    where: {
      ID: id
    }
  });
  return result;
}

/**
 * A function to delete a product by id.
 * @param {integer} id - ID of the product
 * @returns {integer} - Number of rows affected
 */
exports.deleteById = async function deleteById(id) {
  let result = await Product.destroy({
    where: {
      ID: id
    }
  });
  return result;
}

/**
 * The Product model
 */
exports.Product = Product;