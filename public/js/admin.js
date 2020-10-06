const deleteProduct = async btn => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value
  const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value
  const productEl = btn.closest('article')
  try {
    const result = await fetch(`/admin/delete-product/${prodId}`, {
      method: 'DELETE',
      headers: {
        'csrf-token': csrfToken
      }
    })
    // const data = await result.json()
    // console.log(data)
    productEl.remove()
  } catch (error) {
    console.log(error)
  }
}
