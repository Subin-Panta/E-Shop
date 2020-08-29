const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const errorController = require('./controllers/error')
const sequelize = require('./util/database')
const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views') // this is actually the dafault setting

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(errorController.error)
sequelize
  .sync()
  .then(result => {
    app.listen(8000)
  })
  .catch(err => {
    console.log(err)
  })
//154 dekhi
