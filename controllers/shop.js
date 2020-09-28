const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products'
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.getProduct = async (req, res, next) => {
  const id = req.params.id
  try {
    const product = await Product.findById(id)
    res.render('shop/product-detail', {
      product,
      pageTitle: product.title,
      path: '/products'
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.getIndex = async (req, res) => {
  try {
    const products = await Product.find()
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.getCart = async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate()
    const cartProducts = user.cart.items
    const price = user.cart.price
    res.render('shop/cart', {
      pageTitle: 'Cart',
      path: '/cart',
      cartProducts,
      price
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.postCart = async (req, res, next) => {
  const id = req.body.id
  try {
    await req.user.addToCart(id)
    res.redirect('/cart')
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  })
}
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id })
    res.render('shop/orders', {
      pageTitle: 'My Orders',
      path: '/orders',
      orders
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
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
        email: req.user.email,
        userId: req.user
      }
    })
    await order.save()
    req.user.clearCart()
    res.redirect('/orders')
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.postCartDeleteProduct = async (req, res, next) => {
  const id = req.params.id
  try {
    await req.user.removeFromCart(id)
    res.redirect('/cart')
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId
  try {
    const order = await Order.findById(orderId)
    if (!order || order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Not Authorized'))
    }
    const invoiceName = 'Invoice-' + orderId + '.pdf'
    const invoicePath = path.join('data', 'invoices', invoiceName)
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err)
    //   }
    //   res.setHeader('Content-Type', 'application/pdf')
    //   res.setHeader(
    //     'Content-Disposition',
    //     'inline; filename="' + invoiceName + '"'
    //   )
    //   res.send(data)
    // })
    const file = fs.createReadStream(invoicePath)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + invoiceName + '"'
    )
    file.pipe(res)
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
