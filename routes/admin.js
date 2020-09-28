const path = require('path')
const { body } = require('express-validator')
const express = require('express')

const adminController = require('../controllers/admin')

const isAuth = require('../middleware/isAuth')
const router = express.Router()
// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct)

// // /admin/add-product => POST
router.post(
  '/add-product',
  [
    isAuth,
    body('title').trim().not().isEmpty().withMessage('Please Enter A title'),
    body(
      'price',
      'Price is Required and Must be a Number with two decimal Places'
    ).isFloat(),
    body('description', 'Minimum length 5 chars ').trim().isLength({ min: 5 })
  ],
  adminController.postAddProduct
)
// //admin/products
router.get('/products', isAuth, adminController.getProducts)
router.get('/edit-product/:id', isAuth, adminController.getEditProduct)
router.post(
  '/edit-product',
  [
    isAuth,
    body('title').trim().not().isEmpty().withMessage('Please Enter A title'),

    body(
      'price',
      'Price is Required and Must be a Number with two decimal Places'
    ).isFloat(),
    body('description', 'Minimum length 5 chars ').trim().isLength({ min: 5 })
  ],
  adminController.postEditProduct
)
router.post('/delete-product/:id', isAuth, adminController.deleteProduct)
module.exports = router
