
/**
 * An ORM module that defines the CategoryItem model.
 * @module models/category-item
 */

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
    allowNull: false,
    unique: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: false
  }
}, { timestamps: false });
/*
sequelize.sync().then(() => {
   console.log('CategoryItem table created successfully!');
}).catch((error) => {
   console.error('Unable to create table CategoryItem: ', error);
});*/

/**
 * An object containing Category Item details
 * @typedef {Object} CategoryItem
 * @property {integer} ID - ID of the category item
 * @property {integer} productId - ID of the product
 * @property {integer} categoryId - ID of the category
 */

/**
 * A function to add product to category.
 * @param {integer} productId - ID of the product
 * @param {integer} categoryId - ID of the category
 * @returns {CategoryItem} - Newly created category item details
 */
exports.addToCategory = async function addToCategory(productId, categoryId) {
  let result = await CategoryItem.create({ productId: productId, categoryId: categoryId});
  return result;
}
/**
 * A function to delete product from category.
 * @param {integer} productId - ID of the product
 * @param {integer} categoryId - ID of the category
 * @returns {integer} - Number of affected rows
 */
exports.deleteFromCategory = async function deleteFromCategory(productId, categoryId) {
  let result = await CategoryItem.destroy({
    where: {
      productId: productId, 
      categoryId: categoryId
    }
  });
  return result;
}

/**
 * The CategoryItem model
 */
exports.CategoryItem = CategoryItem;