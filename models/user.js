// const fs = require('fs')
// const path = require('path')
// const Rootdir = require('../util/path')

// const p = path.join(Rootdir, 'data', 'cart.json')
// module.exports = class Cart {
//   static addProduct(id, productPrice) {
//     //fetch Previous CARt
//     fs.readFile(p, (error, data) => {
//       let cart = { products: [], totalPrice: 0 }
//       if (!error) {
//         cart = JSON.parse(data)
//       }

//       //find Existing product
//       const existingProductIndex = cart.products.findIndex(p => p.id === id)
//       const existingProduct = cart.products[existingProductIndex]
//       let updatedProduct
//       //add new Product / increase qauntity
//       if (existingProduct) {
//         updatedProduct = { ...existingProduct, qty: existingProduct.qty + 1 }
//         cart.products[existingProductIndex] = updatedProduct
//       } else {
//         updatedProduct = { id: id, qty: 1 }
//         cart.products.push(updatedProduct)
//       }

//       cart.totalPrice = cart.totalPrice + +productPrice
//       fs.writeFile(p, JSON.stringify(cart), err => {
//         console.log(err)
//       })
//     })
//   }
//   static deleteById(id, price) {
//     fs.readFile(p, (error, data) => {
//       if (error) {
//         return
//       }
//       const cart = JSON.parse(data)
//       const updatedCart = { ...cart }
//       const product = updatedCart.products.find(item => item.id === id)
//       if (!product) {
//         return
//       }
//       updatedCart.products = updatedCart.products.filter(item => item.id !== id)

//       updatedCart.totalPrice = updatedCart.totalPrice - price * product.qty
//       fs.writeFile(p, JSON.stringify(updatedCart), err => {
//         console.log(err)
//       })
//     })
//   }
//   static getCart(cb) {
//     fs.readFile(p, (err, data) => {
//       if (err) {
//         cb(null)
//       } else {
//         const cart = JSON.parse(data)
//         cb(cart)
//       }
//     })
//   }
// }
