const Product = require('../models/product')
const Order = require('../models/order')
exports.getProducts = async (req, res, next) => {
  const products = await Product.find()
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'Products',
    path: '/products',
    isAuthenticated: req.session.isLoggedIn
  })
}
exports.getProduct = async (req, res, next) => {
  const id = req.params.id
  const product = await Product.findById(id)
  res.render('shop/product-detail', {
    product,
    pageTitle: product.title,
    path: '/products',
    isAuthenticated: req.session.isLoggedIn
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
  const price = user.cart.price
  res.render('shop/cart', {
    pageTitle: 'Cart',
    path: '/cart',
    cartProducts,
    price,
    isAuthenticated: req.session.isLoggedIn
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
    path: '/checkout',
    isAuthenticated: req.session.isLoggedIn
  })
}
exports.getOrders = async (req, res, next) => {
  const orders = await Order.find({ 'user.userId': req.user._id })
  console.log(orders)

  res.render('shop/orders', {
    pageTitle: 'My Orders',
    path: '/orders',
    orders,
    isAuthenticated: req.session.isLoggedIn
  })
}
exports.postOrder = async (req, res, next) => {
  try {
    const all = await req.user.populate('cart.items.productId').execPopulate()
    const cartProducts = all.cart.items.map(item => {
      return {
        product: { ...item.productId._doc },
        quantity: item.quantity
      }
    })
    const cartPrice = all.cart.price
    const order = new Order({
      products: cartProducts,
      price: cartPrice,
      user: {
        name: req.user.name,
        userId: req.user
      }
    })
    await order.save()
    req.user.clearCart()
    res.redirect('/orders')
  } catch (error) {
    console.log(error)
  }
}
exports.postCartDeleteProduct = async (req, res, next) => {
  const id = req.params.id
  await req.user.removeFromCart(id)
  res.redirect('/cart')
}
