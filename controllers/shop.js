const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll()
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products'
    })
  } catch (error) {
    console.log(error)
  }
}
exports.getProduct = async (req, res, next) => {
  const proid = req.params.id
  try {
    const products = await Product.findAll({
      where: {
        id: proid
      }
    })
    //or use findByPk(id) /doesnt return a array
    const product = products[0]
    res.render('shop/product-detail', {
      product,
      pageTitle: product.title,
      path: '/products'
    })
  } catch (error) {
    console.log(error)
  }
}
exports.getIndex = async (req, res) => {
  try {
    const products = await Product.findAll()

    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    })
  } catch (error) {
    console.log(error)
  }
}
exports.getCart = async (req, res) => {
  try {
    const cart = await req.user.getCart()
    const cartProducts = await cart.getProducts()
    console.log(cartProducts)
    res.render('shop/cart', {
      pageTitle: 'Cart',
      path: '/cart',
      cartProducts
    })
  } catch (error) {
    console.log(error)
  }
}

exports.postCart = async (req, res, next) => {
  const id = req.body.id
  try {
    const cart = await req.user.getCart()
    const products = await cart.getProducts({
      where: {
        id: id
      }
    })
    let product
    if (products.length > 0) {
      product = products[0]
    }
    let newQuantity = 0
    if (product) {
      const oldQuantity = product.cartItem.quantity
      newQuantity = oldQuantity + 1
      await cart.addProduct(product, {
        through: { quantity: newQuantity }
      })
    } else {
      const p = await Product.findByPk(id)
      await cart.addProduct(p, {
        through: {
          quantity: 1
        }
      })
    }

    res.redirect('/cart')
  } catch (error) {
    console.log(error)
  }
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
exports.postCartDeleteProduct = async (req, res, next) => {
  const id = req.params.id
  try {
    const cart = await req.user.getCart()
    const products = await cart.getProducts({ where: { id: id } })
    const product = products[0]
    await product.cartItem.destroy()
    res.redirect('/cart')
  } catch (error) {
    console.log(error)
  }
}
