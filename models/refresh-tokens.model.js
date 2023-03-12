const { Sequelize, DataTypes } = require("sequelize");

const sequelize = require('../db');

const Token = sequelize.define("tokens", {
  ID: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

sequelize.sync().then(() => {
   console.log('Token table created successfully!');
}).catch((error) => {
   console.error('Unable to create table Token: ', error);
});

// add token
exports.addToken = async function addToken(token, email) {
  let result = await Token.create({ token: token, userEmail: email });
  return result;
}

// get token
exports.getToken = async function getToken(token) {
  let result =  await Token.findOne({ 
    where: {
      token: token
    }
  });
  
  return result;
}

// delete token
exports.deleteToken = async function deleteToken(token) {
  let result = await Token.destroy({
    where: {
      token: token
    }
  });
  return result;
}

exports.Token = Token;