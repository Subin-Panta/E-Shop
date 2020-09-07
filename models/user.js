const getDb = require('../util/database').getDb
const mongodb = require('mongodb')
const Product = require('./product')
class User {
  constructor(username, email, cart, userId) {
    this.name = username
    this.email = email
    this.cart = cart
    this._id = userId
  }
  async save() {
    const db = getDb()
    try {
      await db.collection('users').insertOne(this)
    } catch (error) {
      console.log(error)
    }
  }
  async addToCart(id) {
    const db = getDb()
    const pid = new mongodb.ObjectId(id)
    let updatedCartItems = []
    if (this.cart) {
      updatedCartItems = [...this.cart.items]
      const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productID.toString() === pid.toString()
      })
      if (cartProductIndex >= 0) {
        let newQuantity = this.cart.items[cartProductIndex].quantity + 1
        updatedCartItems[cartProductIndex].quantity = newQuantity
      } else {
        updatedCartItems.push({ productID: pid, quantity: 1 })
      }
    } else {
      updatedCartItems.push({ productID: pid, quantity: 1 })
    }
    const updatedCart = {
      items: updatedCartItems
    }
    try {
      await db.collection('users').updateOne(
        { _id: this._id },
        {
          $set: {
            cart: updatedCart
          }
        }
      )
    } catch (error) {
      console.log(error)
    }
  }
  async getCartProducts() {
    const db = getDb()
    let cartProducts = []
    if (this.cart && this.cart.items) {
      const productIds = this.cart.items.map(i => i.productID)
      try {
        const products = await db
          .collection('products')
          .find({ _id: { $in: productIds } })
          .toArray()

        cartProducts = products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(
              i => i.productID.toString() === p._id.toString()
            ).quantity
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
    return cartProducts
  }
  async deleteItemFromCart(productId) {
    const db = getDb()
    const updatedCartItems = this.cart.items.filter(
      i => i.productID.toString() !== productId
    )
    try {
      await db.collection('users').updateOne(
        { _id: this._id },
        {
          $set: {
            cart: { items: updatedCartItems }
          }
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  static async findById(id) {
    const db = getDb()
    try {
      const user = await db
        .collection('users')
        .find({ _id: new mongodb.ObjectId(id) })
        .next()
      return user
    } catch (error) {
      console.log(error)
    }
  }
  async addOrder() {
    try {
      const db = getDb()
      const products = await this.getCartProducts()
      const order = {
        items: products,
        user: {
          _id: new mongodb.ObjectId(this._id),
          name: this.name,
          email: this.email
        }
      }
      await db.collection('orders').insertOne(order)
      const updatedCartItems = []
      await db.collection('users').updateOne(
        { _id: this._id },
        {
          $set: {
            cart: { items: updatedCartItems }
          }
        }
      )
    } catch (error) {
      console.log(error)
    }
  }
  async getOrders() {
    const db = getDb()
    const orders = await db
      .collection('orders')
      .find({
        'user._id': this._id
      })
      .toArray()
    return orders
  }
}
module.exports = User
