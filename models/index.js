'use strict';

const sequelize = require('../config/database');

// Importar os modelos
const User = require('./user');
const Transaction = require('./transaction');
const Saving = require('./saving');

// Definir as associações
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Saving, { foreignKey: 'userId' });
Saving.belongsTo(User, { foreignKey: 'userId' });

// Testar a conexão com o banco de dados
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('Erro ao conectar com o banco de dados:', err);
  });

module.exports = {
  sequelize,
  User,
  Transaction,
  Saving
};
