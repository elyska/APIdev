
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');
const Role = sequelize.define("roles", {
   name: {
     type: DataTypes.STRING(16),
     primaryKey: true,
     allowNull: false,
     unique: true
   },
   description: {
     type: DataTypes.TEXT,
   },
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('Role table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Role: ', error);
});

module.exports = Role;