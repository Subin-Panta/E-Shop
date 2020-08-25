const fs = require('fs')
const path = require('path')
const Rootdir = require('../util/path')
const p = path.join(Rootdir, 'data', 'products.json')
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
  constructor(t) {
    this.title = t
  }
  save() {
    getProductsFromFile(products => {
      products.push(this)
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err)
      })
    })
  }
  static fetchAll(cb) {
    getProductsFromFile(cb)
  }
}
