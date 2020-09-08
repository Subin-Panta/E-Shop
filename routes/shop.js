const path = require('path')

const express = require('express')
const shopController = require('../controllers/shop')

const router = express.Router()

router.get('/', shopController.getIndex)
router.get('/cart', shopController.getCart)
router.post('/cart', shopController.postCart)
router.get('/products', shopController.getProducts)
// router.get('/checkout', shopController.getCheckout)
// router.get('/orders', shopController.getOrders)
router.post('/orders', shopController.postOrder)
router.get('/product/:id', shopController.getProduct)
router.post('/cart-delete-item/:id', shopController.postCartDeleteProduct)
module.exports = router
