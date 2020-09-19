const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const config = require('config')

const apiKey = config.get('apiKey')
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: apiKey
    }
  })
)
exports.getLogin = (req, res, next) => {
  //   console.log(req.session.isLoggedIn)
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: null
    // errorMessage: req.flash('error')
  })
}
exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({ email })
    if (!user) {
      // req.flash('error', 'Invalid Credentials')
      // return res.redirect('/login')
      return res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid Credentials'
      })
    }
    const result = await bcrypt.compare(password, user.password)
    if (result) {
      req.session.isLoggedIn = true
      req.session.user = user
      return req.session.save(err => {
        console.log(err)
        return res.redirect('/')
      })
    }
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Invalid Credentials'
    })
  } catch (error) {
    console.log(error)
  }
}
exports.postLogout = async (req, res, next) => {
  try {
    await req.session.destroy()
    res.redirect('/')
  } catch (error) {
    console.log(error)
  }
}
exports.getSignUp = (req, res, next) => {
  res.render('auth/signUp', {
    path: '/signup',
    pageTitle: 'Sign Up',
    errorMessage: null
  })
}
exports.postSignUp = async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  try {
    let user = await User.findOne({ email })
    if (user) {
      return res.render('auth/signUp', {
        path: '/signup',
        pageTitle: 'Sign Up',
        errorMessage: 'User Already Exists'
      })
    }

    const hashedpassword = await bcrypt.hash(password, 12)
    user = new User({
      email,
      password: hashedpassword,
      cart: {
        items: []
      }
    })
    await user.save()
    await transporter.sendMail({
      to: user.email,
      from: 'sbinpta@gmail.com ',
      subject: 'SignUp',
      html: '<h1>welcome to the club Bitch BITCHEZ</h1>'
    })
    res.redirect('/login')
  } catch (error) {
    console.log(error)
  }
}
