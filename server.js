const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const errorController = require('./controllers/error')
const app = express()
const User = require('./models/user')
app.set('view engine', 'ejs')
app.set('views', 'views') // this is actually the dafault setting

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const connectDb = require('./util/database').connectDb

const run = async () => {
  await connectDb()
  let id = '5f533efb474f731bf0fbefe9'
  app.use(async (req, res, next) => {
    try {
      const user = await User.findById(id)
      if (!user) {
        try {
          const user = await new User('hawa', 'hawa@gmail.com')
          await user.save()
          req.user = new User(user.name, user.email, user.cart, user._id)
        } catch (error) {
          console.log(error)
        }
      } else {
        req.user = new User(user.name, user.email, user.cart, user._id)
      }

      next()
    } catch (error) {
      console.log(error)
    }
  })
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(express.static(path.join(__dirname, 'public')))

  app.use('/admin', adminRoutes)
  app.use(shopRoutes)

  app.use(errorController.error)

  app.listen(8000)
}
run().catch(err => console.log(err))

//196 bata
