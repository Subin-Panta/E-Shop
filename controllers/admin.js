const { validationResult } = require('express-validator')
const fileHelper = require('../util/file')
const Product = require('../models/product')

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage: null
  })
}
exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title
  const image = req.file
  const price = req.body.price
  const description = req.body.description

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const product = {
      title,
      price,
      description
    }

    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: errors.array(),
      product
    })
  }

  const product = new Product({
    // _id: new mongoose.Types.ObjectId('5f6c5fd716dbd71e4456d8a7'),
    title,
    price,
    description,
    userId: req.user
  })
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: [{ msg: 'Attached File is not an Image' }],
      product
    })
  }
  const imageUrl = image.path
  product.imageUrl = imageUrl
  try {
    await product.save()
    res.redirect('/')
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)

    // res.redirect('/500')
    // return res.status(500).render('admin/edit-product', {
    //   pageTitle: 'Add Product',
    //   path: '/admin/add-product',
    //   editing: false,
    //   errorMessage: [{ msg: 'Error Occured Please Try again' }],
    //   product
    // })
  }
}
exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect('/')
  }
  const id = req.params.id
  try {
    const product = await Product.findById(id)

    if (!product || product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/products',
      editing: editMode,
      product,
      errorMessage: null
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.postEditProduct = async (req, res, next) => {
  const id = req.body.id
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedimage = req.file
  const updatedDesc = req.body.description
  const errors = validationResult(req)
  try {
    const product = await Product.findById(id)
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/')
    }

    product.title = updatedTitle
    product.description = updatedDesc
    product.price = updatedPrice
    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/products',
        editing: true,
        product,
        errorMessage: errors.array()
      })
    }
    if (updatedimage) {
      fileHelper.deleteFile(product.imageUrl)
      product.imageUrl = updatedimage.path
    }
    await product.save()

    res.redirect('/admin/products')
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id })
    // const products = await Product.find()
    // const products = await Product.find().populate('userId')
    // console.log(products)
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id
    const product = await Product.findById(id)
    if (!product) {
      return next(new Error('No Product'))
    }
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/')
    }
    fileHelper.deleteFile(product.imageUrl)
    const exists = req.user.cart.items.findIndex(item => item.productId == id)
    if (exists < 0) {
      await Product.findByIdAndDelete(id)
    } else {
      await req.user.removeFromCart(id)
      await Product.findByIdAndDelete(id)
    }
    res.redirect('/admin/products')
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  }
}
