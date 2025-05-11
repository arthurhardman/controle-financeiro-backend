'use strict';

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Saving extends Model {}

Saving.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('em_andamento', 'concluida', 'cancelada'),
      allowNull: false,
      defaultValue: 'em_andamento',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Saving',
    tableName: 'savings',
    timestamps: true,
  }
);

module.exports = Saving; 