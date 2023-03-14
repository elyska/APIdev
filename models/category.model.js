
/**
 * An ORM module that defines the Category model.
 * @module models/category
 */

const { Sequelize, DataTypes,belongsToMany } = require("sequelize");

const sequelize = require('../db');

const Product = require('./product.model.js').Product;
const CategoryItem = require('./category-item.model.js').CategoryItem;

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

// associations
Product.belongsToMany(Category, { through: CategoryItem, foreignKey: 'productId' });
Category.belongsToMany(Product, { through: CategoryItem, foreignKey: 'categoryId' });

/**
 * An object containing Category details
 * @typedef {Object} Category
 * @property {integer} ID - ID of the category
 * @property {string} title - The title of the category
 */

/**
 * An object containing Category details for its creation
 * @typedef {Object} CreateCategory
 * @property {string} title - The title of the category
 */

/**
 * A function to get all categories.
 * @returns {Array.<Category>} - A list of all categories
 */
exports.getAll = async function getAll() {
  let result = await Category.findAll();
  return result;
}
/**
 * A function to add a category.
 * @param {CreateCategory} category - ID of the product
 * @returns {Category} - Newly created category details
 */
exports.addCategory = async function addCategory(category) {
  let result = await Category.create(category);
  return result;
}

/**
 * An object containing product details
 * @typedef {Object} Product
 * @property {string} title - name of the product
 * @property {integer} price - price of the product
 * @property {string} description - multiline description of the product
 * @property {string} image - URL of the product image
 * @property {CategoryItem} categoryItems - order item details
 */

/**
 * An object containing Category Item details
 * @typedef {Object} CategoryItem
 * @property {integer} ID - ID of the category item
 * @property {integer} productId - ID of the product
 * @property {integer} categoryId - ID of the category
 */

/**
 * A function to get products in a category.
 * @param {integer} id - ID of the category
 * @returns {Array.<Product>} - List of products in the category
 */
exports.getCategoryProducts = async function getCategoryProducts(id) {
  let result =  await Category.findAll({ 
    where: {
      ID: id
    },
    include: Product 
  });
  
  if (result.length > 0) return result[0].products; // results found
  return result; // no results found
}

/**
 * A function to delete a category by id.
 * @param {integer} id - ID of the category
 * @returns {integer} - number of rows affected
 */
exports.deleteById = async function deleteById(id) {
  let result = await Category.destroy({
    where: {
      ID: id
    }
  });
  console.log(result)
  console.log(typeof result)
  return result;
}


/**
 * The Category model
 */
exports.Category = Category;