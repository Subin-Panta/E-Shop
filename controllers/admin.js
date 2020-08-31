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
    await req.user.createProduct({
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
    const products = await req.user.getProducts({ where: { id: id } })
    const product = products[0]
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
exports.postEditProduct = async (req, res, next) => {
  const id = req.body.id
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description

  try {
    const products = await req.user.getProducts({ where: { id: id } })
    const product = products[0]
    product.title = updatedTitle
    product.price = updatedPrice
    product.imageUrl = updatedImageUrl
    product.description = updatedDesc
    const response = await product.save()
    console.log(response)
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error)
  }
}
exports.getProducts = async (req, res, next) => {
  try {
    const products = await req.user.getProducts()

    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    })
  } catch (error) {
    console.log(error)
  }
}
exports.deleteProduct = async (req, res, next) => {
  const response = await Product.destroy({
    where: {
      id: req.params.id
    }
  })
  console.log(response)
  res.redirect('/admin/products')
}
