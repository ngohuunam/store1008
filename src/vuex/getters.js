export const prod = state => id => {
  const prod = state.prods.find(prod => prod._id === id)
  return prod
}

export const colors = (state, getters) => id => {
  const prod = getters.prod(id)
  return prod ? prod.colors : []
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

export const homeItemInfo = state => prodId => {
  const info = state.homeItemInfo.find(item => item.prodId === prodId)
  if (info) return info
  else return { size: null, hex: null, des: null }
}

export const cartItemInfo = (state, getters) => item => {
  const prod = getters.prod(item.prodId)
  const color = prod.colors.find(_color => _color.value === item.hex)
  const img_i = item.img_i || 0
  const img = color.imgs[img_i]
  const sizeInfo = prod.sizeInfo.map(inf => {
    const INFO = color.sizeInfo.find(_inf => _inf.label === inf.label)
    if (INFO) inf.value === INFO.value
    return inf
  })
  sizeInfo.sort(function(a, b) {
    const nameA = a.label.toUpperCase()
    const nameB = b.label.toUpperCase()
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    return 0
  })
  const size = color.sizes.find(_size => _size.size === item.size) || {
    stock: 0,
    sale: 0,
    label: item.size,
    price: 0,
  }
  return {
    ...size,
    ...{ img: img, sizeInfo: sizeInfo, colorInfo: prod.colorInfo },
  }
}

export const orderImg = (state, getters) => item => {
  return getters.cartItemInfo(item).img
}
export const itemPrice = (state, getters) => item => {
  return getters.cartItemInfo(item).price
}
export const remain = (state, getters) => item => {
  const orderedLen = state.ordered.reduce((res, curr) => {
    return (res += curr.status.confirmed ? 0 : curr.items.filter(_item => _item.bagid === item.id).length)
  }, 0)
  const remain = getters.cartItemInfo(item).stock - item.order - orderedLen
  return remain
}
