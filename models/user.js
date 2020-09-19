const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Product = require('./product')
const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ],
    price: { type: Number, default: 0 }
  }
})
userSchema.methods.addToCart = async function (id) {
  let updatedCartItems = []
  updatedCartItems = [...this.cart.items]
  const product = await Product.findById(id)
  console.log(product)
  const productPrice = product.price
  this.cart.price = this.cart.price + productPrice
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === id
  })
  if (cartProductIndex >= 0) {
    let newQuantity = this.cart.items[cartProductIndex].quantity + 1
    updatedCartItems[cartProductIndex].quantity = newQuantity
  } else {
    updatedCartItems.push({ productId: id, quantity: 1 })
  }
  this.cart.items = updatedCartItems
  try {
    await this.save()
  } catch (error) {
    console.log(error)
  }
}
userSchema.methods.removeFromCart = async function (id) {
  const productIndex = this.cart.items.findIndex(
    item => item.productId.toString() === id
  )
  const productQuantity = this.cart.items[productIndex].quantity
  const updatedCartItems = this.cart.items.filter(
    item => item.productId.toString() !== id
  )
  const product = await Product.findById(id)
  const productPrice = product.price
  this.cart.price = this.cart.price - productPrice * productQuantity

  this.cart.items = updatedCartItems
  try {
    await this.save()
  } catch (error) {
    console.log(error)
  }
}
userSchema.methods.clearCart = async function () {
  this.cart.items = []
  this.cart.price = 0
  try {
    await this.save()
  } catch (error) {
    console.log(error)
  }
}
module.exports = mongoose.model('User', userSchema)
