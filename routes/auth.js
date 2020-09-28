const express = require('express')
const authController = require('../controllers/auth')
const { body, check } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const router = express.Router()
router.get('/login', authController.getLogin)
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please Enter A Valid Email')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value })
        if (!user) {
          throw new Error('Invalid Credentials')
        }
        return true
      }),
    body('password').isLength({ min: 6 }).withMessage('Password Required')
  ],
  authController.postLogin
)
router.post('/logout', authController.postLogout)
router.get('/signup', authController.getSignUp)
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please Enter a Valid Email')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        let user = await User.findOne({ email: value })
        if (user) {
          throw new Error('User Already Exist')
        }
        return true
      }),

    body('password', 'Passwords must be 6 Characters Long and alphanumeric ')
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords Have To Match')
        }
        return true
      })
  ],
  authController.postSignUp
)
router.get('/reset', authController.getReset)
router.post('/reset', authController.postReset)
router.get('/reset/:token', authController.getNewPassword)
router.post('/newPassword', authController.postNewPassword)
module.exports = router
