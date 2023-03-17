/**
 * Initializes the database with sample data.
 * @module inserts
 */

const sequelize = require('./db');
const User = require('./models/user.model.js').User;
const Product = require('./models/product.model.js').Product;
const Category = require('./models/category.model.js').Category;
const CategoryItem = require('./models/category-item.model.js').CategoryItem;
const Order = require('./models/order.model.js').Order;
const OrderItem = require('./models/order-item.model.js').OrderItem;

User.bulkCreate([
  { name: "admin", password: "$2b$10$ia9v64.qGCdaCPVkUqaeJOsMBKS694QEaKAa3y052200.Tl2IRyci", email: "admin@admin.com", address: "Coventry", role: "admin" },
  { name: "user1", password: "$2b$10$ia9v64.qGCdaCPVkUqaeJOsMBKS694QEaKAa3y052200.Tl2IRyci", email: "user1@user.com", address: "Coventry", role: "user" },
  { name: "user2", password: "$2b$10$ia9v64.qGCdaCPVkUqaeJOsMBKS694QEaKAa3y052200.Tl2IRyci", email: "user2@user.com", address: "Birmingham", role: "user" },
  { name: "user3", password: "$2b$10$ia9v64.qGCdaCPVkUqaeJOsMBKS694QEaKAa3y052200.Tl2IRyci", email: "user3@user.com", address: "London", role: "user" },
  { name: "user4", password: "$2b$10$ia9v64.qGCdaCPVkUqaeJOsMBKS694QEaKAa3y052200.Tl2IRyci", email: "user4@user.com", address: "London", role: "user" },
]);
Product.bulkCreate([
  { title: "Product 1", description: "description", image: "url", price: 12.99 },
  { title: "Product 2", description: "description", image: "url", price: 10.99 },
  { title: "Product 3", description: "description", image: "url", price: 5 },
  { title: "Product 4", description: "description", image: "url", price: 0.99 },
  { title: "Product 5", description: "description", image: "url", price: 9.99 },
]);

Category.bulkCreate([
  { title: "Category 1"},
  { title: "Category 2"},
  { title: "Category 3"},
]);

CategoryItem.bulkCreate([
  { productId: 1, categoryId: 1},
  { productId: 1, categoryId: 2},
  { productId: 2, categoryId: 1},
  { productId: 3, categoryId: 2},
  { productId: 4, categoryId: 3},
]);