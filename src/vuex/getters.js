export const prod = state => id => {
  const prod = state.prods.find(prod => prod._id === id)
  return prod
}

export const colors = (state, getters) => id => {
  const prod = getters.prod(id)
  return prod ? prod.colors : []
}

export const currentItems = (state, getters) => id => {
  const prod = getters.prod(id)
  const currents = { items: [], colors: [] }
  if (prod && prod.colors.length) {
    prod.colors.map(color => {
      currents.colors.push({ id: color._id, rev: color._rev })
      color.sizes.map(size => {
        currents.items.push({ id: size._id, rev: size._rev })
      })
    })
  }
  return currents
}

export const shippingCost = state => {
  return (state.shippingCost * 1000).toLocaleString('vi') + 'đ'
}

export const taxFee = state => {
  return (state.taxFee * 1000).toLocaleString('vi') + 'đ'
}

export const allItems = state => des => {
  return state.bag.filter(item => item[des])
}

export const countBag = state => {
  const FIRST = { cart: 0, order: 0 }
  return state.bag.reduce((RES, item) => {
    if (item.cart) RES.cart++
    if (item.order) RES.order++
    return RES
  }, FIRST)
}

export const quantity = state => id => {
  const item = state.bag.find(_item => _item.id === id)
  if (item) return { cart: item.cart, order: item.order, has: true }
  return { cart: 0, order: 0, has: false }
}

export const countBagByTerm = state => term => {
  const FIRST = { cart: 0, order: 0 }
  const res = state.bag.reduce((RES, item) => {
    if (item.id.includes(term)) {
      if (item.cart) RES.cart++
      if (item.order) RES.order++
    }
    return RES
  }, FIRST)
  return res
}

export const hasStar = state => id => {
  return state.star.some(item => item.id.includes(id))
}

export const hasCartChecked = state => {
  return state.bag.some(item => item.check)
}

export const allCartChecked = state => {
  return state.bag.every(item => item.check)
}

export const homeItemInfo = state => setName => {
  const info = state.homeItemInfo.find(item => item.name === setName)
  if (info) return info
  else return { size: null, hex: null, des: null }
}

export const cartItemInfo = (state, getters) => item => {
  const prod = getters.prod(item.name)
  const color = prod.colors.find(_color => _color.value === item.hex)
  const imgs = color.imgs
  const sizeInfo = color.sizes.find(_size => _size.size === item.size) || {
    stock: 0,
    sale: 0,
    label: item.size,
    price: 0,
  }
  return {
    ...sizeInfo,
    ...{ imgs: imgs, sizeInfo: prod.sizeInfo, colorInfo: prod.colorInfo },
  }
}

export const orderImg = (state, getters) => item => {
  return getters.cartItemInfo(item).imgs[0]
}
export const itemPrice = (state, getters) => item => {
  return getters.cartItemInfo(item).price
}
