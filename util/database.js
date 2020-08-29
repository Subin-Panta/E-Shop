const Sequelize = require('sequelize')
const config = require('config')
const sequelize = new Sequelize(
  'node-complete',
  'root',
  config.get('databasePassword'),
  {
    dialect: 'mysql',
    host: 'localhost'
  }
)
module.exports = sequelize
