const fs = require('fs')
const path = require('path')
const Rootdir = require('../util/path')
const Cart = require('./cart')
const p = path.join(Rootdir, 'data', 'products.json')
const { v4: uuidv4 } = require('uuid')
const getProductsFromFile = cb => {
  fs.readFile(p, (err, data) => {
    if (err) {
      return cb([])
    }
    {
      cb(JSON.parse(data))
    }
  })
}
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }
  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(p => p.id === this.id)
        const UpdatedProducts = [...products]
        UpdatedProducts[existingProductIndex] = this
        fs.writeFile(p, JSON.stringify(UpdatedProducts), err => {
          console.log(err)
        })
      } else {
        this.id = uuidv4()
        products.push(this)
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err)
        })
      }
    })
  }
  static fetchAll(cb) {
    getProductsFromFile(cb)
  }
  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id)
      cb(product)
    })
  }
  static delete(id) {
    getProductsFromFile(products => {
      const product = products.find(item => item.id === id)
      const newProducts = products.filter(item => item.id !== id)
      fs.writeFile(p, JSON.stringify(newProducts), err => {
        if (!err) {
          Cart.deleteById(id, product.price)
        }
      })
    })
  }
}
