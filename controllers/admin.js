const Product = require('../models/product')
const mongodb = require('mongodb')
exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  })
}
exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description
  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    null,
    req.user._id
  )
  const result = await product.save()

  res.redirect('/')
}
exports.getEditProduct = async (req, res, next) => {
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
    product
  })
}
exports.postEditProduct = async (req, res, next) => {
  const id = req.body.id
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description

  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDesc,
    updatedImageUrl,
    id
  )
  await product.save()
  res.redirect('/admin/products')
}
exports.deleteProduct = async (req, res, next) => {
  await Product.deleteById(req.params.id)
  res.redirect('/admin/products')
}
exports.getProducts = async (req, res, next) => {
  const products = await Product.fetchAll()

  res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products'
  })
}
