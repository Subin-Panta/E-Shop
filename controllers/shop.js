const Product = require('../models/product')

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

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders({ include: ['products'] })
    res.render('shop/orders', {
      pageTitle: 'My Orders',
      path: '/orders',
      orders
    })
  } catch (error) {
    console.log(error)
  }
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
exports.postOrder = async (req, res, next) => {
  try {
    const cart = await req.user.getCart()
    const products = await cart.getProducts()
    const order = await req.user.createOrder()
    await order.addProducts(
      products.map(product => {
        product.orderItem = {
          quantity: product.cartItem.quantity
        }
        return product
      })
    )
    await cart.setProducts(null)
    res.redirect('/orders')
  } catch (error) {
    console.log(error)
  }
}
