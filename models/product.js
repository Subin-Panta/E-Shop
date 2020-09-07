const mongodb = require('mongodb')
const getDb = require('../util/database').getDb
class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
    this._id = id ? new mongodb.ObjectID(id) : null
    this.userId = userId
  }
  async save() {
    const db = getDb()
    if (this._id) {
      try {
        await db.collection('products').updateOne(
          {
            _id: this._id
          },
          {
            $set: this
          }
        )
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await db.collection('products').insertOne(this)
      } catch (error) {
        console.log(error)
      }
    }
  }
  static async fetchAll() {
    const db = getDb()
    try {
      const products = await db.collection('products').find().toArray()
      return products
    } catch (error) {
      console.log(error)
    }
  }
  static async findById(id) {
    const db = getDb()
    try {
      const product = await db
        .collection('products')
        .find({ _id: new mongodb.ObjectId(id) })
        .next()
      return product
    } catch (error) {
      console.log(error)
    }
  }
  static async deleteById(id) {
    const db = getDb()
    try {
      await db
        .collection('products')
        .deleteOne({ _id: new mongodb.ObjectID(id) })
      console.log('Deleted')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = Product
