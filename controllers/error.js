exports.error = (req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: null
  })
}
exports.fiveHundred = (req, res) => {
  res.status(500).render('500', {
    pageTitle: 'Error Ocuured',
    path: null
  })
}
