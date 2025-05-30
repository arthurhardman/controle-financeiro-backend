require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: 'teste',
    database: 'financeapp',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  },
  test: {
    username: 'postgres',
    password: 'teste',
    database: 'financeapp_test',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 