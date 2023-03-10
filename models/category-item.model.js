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
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('CategoryItem table created successfully!');
}).catch((error) => {
   console.error('Unable to create table CategoryItem: ', error);
});

// add product to category
exports.addToCategory = async function addToCategory(productId, categoryId) {
  try {
    let result = await CategoryItem.create({ productId: productId, categoryId: categoryId});
  }
  catch(err)
  {
    return err;
  }
  
  return result;
}

// delete product from category
exports.deleteFromCategory = async function deleteFromCategory(productId, categoryId) {
  let result = await CategoryItem.destroy({
    where: {
      productId: productId, 
      categoryId: categoryId
    }
  });
  return result;
}

exports.CategoryItem = CategoryItem;