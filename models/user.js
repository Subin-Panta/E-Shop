const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
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
    ]
  }
})
userSchema.methods.addToCart = async function (id) {
  let updatedCartItems = []
  updatedCartItems = [...this.cart.items]
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
  const updatedCartItems = this.cart.items.filter(
    item => item.productId  .toString() !== id
  )
  this.cart.items = updatedCartItems
  try {
    await this.save()
  } catch (error) {
    console.log(error)
  }
}
module.exports = mongoose.model('User', userSchema)
