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
exports.getCart = (req, res) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = []
      for (product of products) {
        if (cart !== null) {
          const cartProductData = cart.products.find(
            item => item.id === product.id
          )
          if (cartProductData) {
            const qty = cartProductData.qty
            cartProducts.push({ product, qty: qty })
          }
        } else {
          break
        }
      }
      res.render('shop/cart', {
        pageTitle: 'Cart',
        path: '/cart',
        cartProducts
      })
    })
  })
}

exports.postCart = (req, res, next) => {
  const id = req.body.id
  Product.findById(id, product => {
    Cart.addProduct(id, product.price)
  })
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
exports.postCartDeleteProduct = (req, res, next) => {
  const id = req.params.id
  Product.findById(id, product => {
    Cart.deleteById(id, product.price)
    res.redirect('/cart')
  })
}
