'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {};

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty:  {
          msg: '"Title" is required'
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty:  {
          msg: '"Author" is required'
        }
      }
    },
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};