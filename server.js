const path = require('path')
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const errorController = require('./controllers/error')
const app = express()
const config = require('config')

app.set('view engine', 'ejs')
app.set('views', 'views') // this is actually the dafault setting

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.error)
const mongoURI = config.get('mongoURI')
const run = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('mongoDb Connected')
    app.listen(8000)
  } catch (error) {
    console.log(error)
  }
}
run().catch(err => console.log(err))
