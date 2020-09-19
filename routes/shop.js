const path = require('path')

const express = require('express')
const shopController = require('../controllers/shop')
const isAuth = require('../middleware/isAuth')

const router = express.Router()

router.get('/', shopController.getIndex)
router.get('/cart', isAuth, shopController.getCart)
router.post('/cart', isAuth, shopController.postCart)
router.get('/products', shopController.getProducts)
// router.get('/checkout', shopController.getCheckout)
router.get('/orders', isAuth, shopController.getOrders)
router.post('/create-order', isAuth, shopController.postOrder)
router.get('/product/:id', shopController.getProduct)
router.post(
  '/cart-delete-item/:id',
  isAuth,
  shopController.postCartDeleteProduct
)
module.exports = router
