"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV?.trim() || "development";
var config = require(path.join(__dirname, "../config/config.json"))[env];
var db = {};

// console.log(process.env.DB_HOST);
var sequelize = process.env.DATABASE_URL
  ? // sequelize = new Sequelize(process.env.DATABASE_URL, {
    //     dialect: 'postgres'
    // });
    (sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.USER_NAME,
      process.env.PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DIALECT,
        ssl: {require:true},
        dialectOptions: {
           ssl: {
              require: {require:true}
           }
         }        
      },
    ))
  : (sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DIALECT,
        ssl: {require:true},
        dialectOptions: {
           ssl: {
              require: {require:true}
           }
         }        
      },      
    ));

fs.readdirSync(__dirname)
  .filter(function (file) {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(function (file) {
    var model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
