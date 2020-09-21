const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const config = require('config')
const crypto = require('crypto')
const user = require('../models/user')
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
    res.redirect('/login')
    transporter.sendMail({
      to: user.email,
      from: 'sbinpta@gmail.com ',
      subject: 'SignUp',
      html: '<h1>welcome to the club Bitch BITCHEZ</h1>'
    })
  } catch (error) {
    console.log(error)
  }
}
exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset passWord',
    errorMessage: null
  })
}
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err)
      return res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset passWord',
        errorMessage: 'Please Try Again'
      })
    }
    const token = buffer.toString('hex')
    try {
      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        return res.render('auth/reset', {
          path: '/reset',
          pageTitle: 'Reset passWord',
          errorMessage: 'No account associated with the email address'
        })
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000
      await user.save()
      res.redirect('/')
      transporter.sendMail({
        to: user.email,
        from: 'sbinpta@gmail.com ',
        subject: 'Reset Password',
        html: `
        <p>Dont Forget Your Password DumbShit </p>
        <p>Click This <a href='http://localhost:8000/reset/${token}'>Link</a> to Reset</p>
        <p>expires in 1 Hour  </p>
        `
      })
    } catch (error) {
      console.log(error)
    }
  })
}
exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    })
    if (!user) {
      return res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset passWord',
        errorMessage: 'Token no longer valid'
      })
    }
    res.render('auth/newPassword', {
      path: '/newPassword',
      pageTitle: 'Reset password',
      errorMessage: null,
      userId: user._id.toString(),
      token
    })
  } catch (error) {
    console.log(error)
  }
}
exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const token = req.body.token
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId
    })
    if (!user) {
      return res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset passWord',
        errorMessage: 'Token no longer valid'
      })
    }
    const updatedpassword = await bcrypt.hash(newPassword, 12)
    user.password = updatedpassword
    user.resetToken = undefined
    user.resetTokenExpiration = undefined
    await user.save()
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Password Changed'
    })
  } catch (error) {
    console.log(error)
  }
}
