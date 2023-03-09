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

// get all products
exports.getAll = async function getAll() {
  let result = await Product.findAll();
  return result;
}

// get product by id
exports.getById = async function getById(id) {
  let result = await Product.findAll({
    where: {
      ID: id
    }
  });
  return result;
}

// update product by id
exports.updateById = async function updateById(id, product) {
  let result = await Product.update(product, {
    where: {
      ID: id
    }
  });
  return result;
}

// delete product by id
exports.deleteById = async function deleteById(id) {
  let result = await Product.destroy({
    where: {
      ID: id
    }
  });
  return result;
}

exports.Product = Product;