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
const csrf = require('csurf')

const store = new MongoDBStore({
  uri: mongoURI,
  collection: 'sessions'
})
app.set('view engine', 'ejs')
app.set('views', 'views') // this is actually the dafault setting
const csrfProtection = csrf()
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
app.use(csrfProtection)
app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next()
  }
  try {
    const user = await User.findById(req.session.user._id)
    req.user = user
    next()
  } catch (error) {
    console.log(error)
  }
})
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
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

    app.listen(8000)
  } catch (error) {
    console.log(error)
  }
}
run().catch(err => console.log(err))

//module number 17 ma chu
