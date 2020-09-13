const path = require('path')
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const errorController = require('./controllers/error')
const app = express()
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const config = require('config')
const User = require('./models/user')
const mongoURI = config.get('mongoURI')
const store = new MongoDBStore({
  url: mongoURI,
  collection: 'sessions'
})
app.set('view engine', 'ejs')
app.set('views', 'views') // this is actually the dafault setting

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
const sessionSecret = config.get('sessionSecret')
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store
  })
)
app.use(async (req, res, next) => {
  try {
    const user = await User.findById('5f5c95c243ecfb28489563b8')
    req.user = user
    next()
  } catch (error) {
    console.log(error)
  }
})
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)
app.use(errorController.error)

const run = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('mongoDb Connected')
    const exists = await User.findOne()
    if (!exists) {
      const user = new User({
        name: 'hawa',
        email: 'hawa@gmail.com ',
        cart: {
          items: []
        }
      })
      await user.save()
    }
    app.listen(8000)
  } catch (error) {
    console.log(error)
  }
}
run().catch(err => console.log(err))
