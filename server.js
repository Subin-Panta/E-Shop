const path = require('path')
const mongoose = require('mongoose')
const express = require('express')
const https = require('https')
const fs = require('fs')
require('dotenv').config()
const errorController = require('./controllers/error')
const app = express()
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
// const config = require('config')
const User = require('./models/user')
const mongoURI = process.env.MONGO_URI

const port = process.env.PORT || 8000
const csrf = require('csurf')
const helmet = require('helmet')
const compression = require('compression')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const morgan = require('morgan')
const shopController = require('./controllers/shop')
const isAuth = require('./middleware/isAuth')

const store = new MongoDBStore({
	uri: mongoURI,
	collection: 'sessions'
})
const privateKey = fs.readFileSync('server.key')
const certificate = fs.readFileSync('server.cert')
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + '-' + file.originalname)
	}
})
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/jpg'
	) {
		cb(null, true)
	} else {
		cb(null, false)
	}
}
app.set('view engine', 'ejs')
app.set('views', 'views') // this is actually the dafault setting
const csrfProtection = csrf()
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, 'access.log'),
	{ flags: 'a' }
)
//helmet
app.use(helmet())
app.use(compression())
app.use(morgan('combined', { stream: accessLogStream }))
// app.use(bodyParser.urlencoded({ extended: false }))
//deprecated us the below
app.use(express.urlencoded({ extended: false })) //Parse URL-encoded bodies
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
const sessionSecret = process.env.sessionSecret
app.use(
	session({
		secret: sessionSecret,
		resave: false,
		saveUninitialized: false,
		store
	})
)

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn

	next()
})
app.use(async (req, res, next) => {
	if (!req.session.user) {
		return next()
	}
	try {
		const user = await User.findById(req.session.user._id)

		if (!user) {
			return next()
		}
		req.user = user
		next()
	} catch (err) {
		const error = new Error(err)
		next(error)
	}
})
app.post('/create-order', isAuth, shopController.postOrder)
app.use(csrfProtection)
app.use((req, res, next) => {
	res.locals.csrfToken = req.csrfToken()
	next()
})
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)
app.get('/500', errorController.fiveHundred)
app.use(errorController.error)
app.use((error, req, res, next) => {
	// res.redirect('/500')
	res.status(500).render('500', {
		pageTitle: 'Error Ocuured',
		path: null
	})
})
const run = async () => {
	try {
		await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		console.log('mongoDb Connected')

		https.createServer({ key: privateKey, cert: certificate }, app).listen(port)
	} catch (error) {
		console.log(error)
	}
}
run().catch(err => console.log(err))
