// database ORM

// from https://www.digitalocean.com/community/tutorials/how-to-use-sequelize-with-node-js-and-mysql
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
 'ecommerce',
 'root',
 'codio',
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
   console.log('Connection has been established successfully.');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});

module.exports = sequelize;