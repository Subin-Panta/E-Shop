const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const config = require('config')
const mongoURI = config.get('mongoURI')
let _db
const connectDb = async () => {
  try {
    const client = await MongoClient.connect(mongoURI, {
      useUnifiedTopology: true
    })
    _db = client.db()
    console.log('MongoDB Connected')
  } catch (error) {
    console.log(error)
  }
}
const getDb = () => {
  if (_db) {
    return _db
  }
  throw 'No DataBase Found'
}
exports.connectDb = connectDb
exports.getDb = getDb
