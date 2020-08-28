const Cart = require('./cart')

const db = require('../util/database')
const { v4: uuidv4 } = require('uuid')

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }
  save() {
    //escaping sql injection attacks

    return db.execute(
      'INSERT INTO products(title,price,description,imageUrl) VALUES (?,?,?,?)',
      [this.title, this.price, this.description, this.imageUrl]
    )
  }

  static fetchAll() {
    try {
      return db.execute('SELECT * FROM products')
    } catch (error) {
      console.log(error)
    }
  }
  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
  }
  static delete(id) {}
}
