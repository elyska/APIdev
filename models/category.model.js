const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');

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

// get all categories
exports.getAll = async function getAll() {
  let result = await Category.findAll();
  return result;
}

// add category
exports.addProduct = async function addProduct(category) {
  let result = await Category.create(category);
  return result;
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