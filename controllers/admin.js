const Product = require('../models/product')
const shopController = require('./shop')
exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  })
}
exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user
  })
  try {
    product.save()
    res.redirect('/')
  } catch (error) {
    console.log(error)
  }
}
exports.getEditProduct = async (req, res) => {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect('/')
  }
  const id = req.params.id
  const product = await Product.findById(id)
  if (!product) {
    return res.redirect('/')
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/products',
    editing: editMode,
    product,
    isAuthenticated: req.session.isLoggedIn
  })
}
exports.postEditProduct = async (req, res, next) => {
  const id = req.body.id
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description
  const product = await Product.findById(id)
  product.title = updatedTitle
  product.imageUrl = updatedImageUrl
  product.description = updatedDesc
  product.price = updatedPrice
  await product.save()

  res.redirect('/admin/products', {
    isAuthenticated: req.session.isLoggedIn
  })
}
exports.getProducts = async (req, res, next) => {
  const products = await Product.find()
  // const products = await Product.find().populate('userId')
  // console.log(products)
  res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products',
    isAuthenticated: req.session.isLoggedIn
  })
}
exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id
    const exists = req.user.cart.items.findIndex(item => item.productId == id)
    if (exists < 0) {
      await Product.findByIdAndDelete(id)
    } else {
      await req.user.removeFromCart(id)
      await Product.findByIdAndDelete(id)
    }
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error)
  }
}
