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

// get all categories
exports.getAll = async function getAll() {
  let result = await Category.findAll();
  return result;
}

// add category
exports.addCategory = async function addCategory(category) {
  let result = await Category.create(category);
  return result;
}

// get products in category
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

// delete category by id
exports.deleteById = async function deleteById(id) {
  let result = await Category.destroy({
    where: {
      ID: id
    }
  });
  return result;
}


exports.Category = Category;