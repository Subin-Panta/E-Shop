const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const errorController = require('./controllers/error')
const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')
const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views') // this is actually the dafault setting

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(async (req, res, next) => {
  try {
    const user = await User.findByPk(1)
    req.user = user
    next()
  } catch (error) {
    console.log(error)
  }
})
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(errorController.error)
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Product) //optional one directional relationship is enough
User.hasOne(Cart)
Cart.belongsTo(User) //optional one directional relationship is enough
Cart.belongsToMany(Product, { through: CartItem }) //optional one direction is enoguh
Product.belongsToMany(Cart, { through: CartItem })

const run = async () => {
  try {
    await sequelize
      //.sync({ force: true })
      .sync()
    let user = await User.findByPk(1)
    if (!user) {
      user = await User.create({ name: 'blah', email: 'blah@blah.com' })
    }
    const cart = await Cart.findAll({
      where: {
        userId: 1
      }
    })
    if (!(cart.length > 0)) {
      await user.createCart()
    }
    app.listen(8000)
  } catch (error) {
    console.log(error)
  }
}
run().catch(error => console.log(error))
