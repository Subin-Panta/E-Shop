const Product = require('../models/product')
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

  try {
    const response = await Product.create({
      title,
      price,
      imageUrl,
      description
    })
    console.log('created product')
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
  try {
    const product = await Product.findByPk(id)
    if (!product) {
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/products',
      editing: editMode,
      product
    })
  } catch (error) {
    console.log(error)
  }
}
exports.postEditProduct = (req, res, next) => {
  const id = req.body.id
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description
  const updatedProduct = new Product(
    id,
    updatedTitle,
    updatedImageUrl,
    updatedDesc,
    updatedPrice
  )
  updatedProduct.save()
  res.redirect('/admin/products')
}
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll()
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    })
  } catch (error) {
    console.log(error)
  }
}
exports.deleteProduct = (req, res, next) => {
  Product.delete(req.params.id)
  res.redirect('/admin/products')
}
