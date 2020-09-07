const Product = require('../models/product')
const User = require('../models/user')
// const Cart = require('../models/cart')

exports.getProducts = async (req, res, next) => {
  const products = await Product.fetchAll()
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
exports.getIndex = async (req, res, next) => {
  const products = await Product.fetchAll()
  res.render('shop/index', {
    prods: products,
    pageTitle: 'Shop',
    path: '/'
  })
}
exports.getCart = async (req, res) => {
  const cartProducts = await req.user.getCartProducts()

  res.render('shop/cart', {
    pageTitle: 'Cart',
    path: '/cart',
    cartProducts
  })
}

exports.postCart = async (req, res, next) => {
  const id = req.body.id
  try {
    await req.user.addToCart(id)
  } catch (error) {
    console.log(error)
  }

  res.redirect('/cart')
}
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  })
}
exports.postOrder = async (req, res, next) => {
  try {
    await req.user.addOrder()
    res.redirect('/orders')
  } catch (error) {
    console.log(error)
  }
}
exports.getOrders = async (req, res, next) => {
  const orders = await req.user.getOrders()
  res.render('shop/orders', {
    pageTitle: 'My Orders',
    path: '/orders',
    orders
  })
}
exports.postCartDeleteProduct = async (req, res, next) => {
  const id = req.params.id
  try {
    await req.user.deleteItemFromCart(id)
    res.redirect('/cart')
  } catch (error) {
    console.log(error)
  }
}
