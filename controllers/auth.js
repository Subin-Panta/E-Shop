const User = require('../models/user')
const bcrypt = require('bcryptjs')
exports.getLogin = (req, res, next) => {
  const isLoggedIn = false
  //   console.log(req.session.isLoggedIn)
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn
  })
}
exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({ email })
    if (!user) {
      return res.redirect('/login')
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
    res.redirect('/login')
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
  const isLoggedIn = false
  res.render('auth/signUp', {
    path: '/signup',
    pageTitle: 'Sign Up',
    isAuthenticated: isLoggedIn
  })
}
exports.postSignUp = async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  try {
    let user = await User.findOne({ email })
    if (user) {
      return res.redirect('/signup')
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
    res.redirect('/login')
  } catch (error) {
    console.log(error)
  }
}
