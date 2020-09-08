const Product = require('../models/product')
const Cart = require('../models/user')

exports.getProducts = async (req, res, next) => {
  const products = await Product.find()
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'Products',
    path: '/products'
  })
}
exports.getProduct = async (req, res, next) => {
  const id = req.params.id
  const product = await Product.findById(id)
  res.render('shop/product-detail', {
    product,
    pageTitle: product.title,
    path: '/products'
  })
}
exports.getIndex = async (req, res) => {
  const products = await Product.find()
  res.render('shop/index', {
    prods: products,
    pageTitle: 'Shop',
    path: '/'
  })
}
exports.getCart = async (req, res) => {
  const user = await req.user.populate('cart.items.productId').execPopulate()
  const cartProducts = user.cart.items

  res.render('shop/cart', {
    pageTitle: 'Cart',
    path: '/cart',
    cartProducts
  })
}

exports.postCart = async (req, res, next) => {
  const id = req.body.id
  await req.user.addToCart(id)
  res.redirect('/cart')
}
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  })
}
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'My Orders',
    path: '/orders'
  })
}
exports.postOrder = (req, res, next) => {}
exports.postCartDeleteProduct = async (req, res, next) => {
  const id = req.params.id
  await req.user.removeFromCart(id)
  res.redirect('/cart')
}
