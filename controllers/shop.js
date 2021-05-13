const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const config = require('config')
const stripeKey = process.env.stripeKey
const stripe = require('stripe')(stripeKey)
const ITEMS_PER_PAGE = 3
const pagination = async (page, renderPath, title, viewPath, next, res) => {
	try {
		const numProducts = await Product.find().countDocuments()
		const products = await Product.find()
			.skip((page - 1) * ITEMS_PER_PAGE)
			.limit(ITEMS_PER_PAGE)

		return res.render(renderPath, {
			prods: products,
			pageTitle: title,
			path: viewPath,
			numProducts,
			currentPage: page,
			hasNextPage: ITEMS_PER_PAGE * page < numProducts,
			hasPreviousPage: page > 1,
			nextPage: page + 1,
			prevPage: page - 1,
			lastPage: Math.ceil(numProducts / ITEMS_PER_PAGE)
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
exports.getProducts = (req, res, next) => {
	const page = +req.query.page || 1
	const renderPath = 'shop/product-list'
	const title = 'Products'
	const viewPath = '/products'
	pagination(page, renderPath, title, viewPath, next, res)
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
exports.getIndex = (req, res, next) => {
	const page = +req.query.page || 1
	const renderPath = 'shop/index'
	const title = 'Shop'
	const viewPath = '/'
	pagination(page, renderPath, title, viewPath, next, res)
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
exports.getCheckout = async (req, res, next) => {
	try {
		const user = await req.user.populate('cart.items.productId').execPopulate()
		const cartProducts = user.cart.items
		const price = user.cart.price
		res.render('shop/checkout', {
			pageTitle: 'Checkout',
			path: '/checkout',
			cartProducts,
			price
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
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
		const token = req.body.stripeToken
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
		const charge = stripe.charges.create({
			amount: cartPrice * 100,
			currency: 'usd',
			description: 'Demo Order',
			source: token,
			metadata: { order_id: order._id.toString() }
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
		const pdfDoc = new PDFDocument()
		res.setHeader('Content-Type', 'application/pdf')
		res.setHeader(
			'Content-Disposition',
			'inline; filename="' + invoiceName + '"'
		)
		pdfDoc.pipe(fs.createWriteStream(invoicePath))
		pdfDoc.pipe(res)
		pdfDoc.fontSize(26).text('Invoice')
		pdfDoc.text('---------------------------------------')
		pdfDoc.fontSize(10)
		order.products.map(item =>
			pdfDoc.text(
				`${item.product.title}: ${item.quantity} * Rs ${item.product.price}  `
			)
		)
		pdfDoc.text('----------------------------------------')
		pdfDoc.text(`Total Price: Rs ${order.price}`)
		pdfDoc.end()
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
		// const file = fs.createReadStream(invoicePath)
		// res.setHeader('Content-Type', 'application/pdf')
		// res.setHeader(
		//   'Content-Disposition',
		//   'inline; filename="' + invoiceName + '"'
		// )
		// file.pipe(res)
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
