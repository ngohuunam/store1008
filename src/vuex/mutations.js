import Vue from 'vue'

export const setState = (state, payload) => {
  // console.log('setState payload', payload)
  const prop = payload.des
  const value = payload.value
  state[prop] = value
}

export const setStateArray = (state, payload) => {
  // console.log('setStateArray payload', payload)
  const prop = payload.des
  const value = payload.value
  const key = payload.key
  const index = state[prop].findIndex(ele => ele[key] === value[key])
  if (index > -1) Vue.set(state[prop], index, value)
  else state[prop].push(value)
}

export const pushState = (state, payload) => {
  // console.log('pushState payload', payload)
  const prop = payload.des
  const value = payload.value
  state[prop].push(value)
}

export const spliceState = (state, payload) => {
  // console.log('spliceState payload', payload)
  const prop = payload.des
  let index = payload.index
  if (index === undefined) {
    const key = payload.key
    const value = payload.value
    index = state[prop].findIndex(ele => ele[key] === value)
  }
  state[prop].splice(index, 1)
}

export const login = (state, payload) => {
  console.log(payload)
}

export const register = (state, payload) => {
  console.log(payload)
}

export const logout = state => {
  state.buyer = { name: '', address: '', phone: '', email: '', pass: '', _id: '', _rev: '', at: '', orders: [] }
  state.ordered = []
}

export const itemChange = (state, doc) => {
  const prod = state.prods.find(_prod => _prod._id === doc.prod)
  const color = prod.colors.find(_color => _color.value === doc.hex)
  const index = color.sizes.findIndex(size => size._id === doc._id)
  Vue.set(color.sizes, index, doc)
}

export const change = (state, info) => {
  const index = state.bag.findIndex(item => item._id === info._id)
  const item = state.bag[index]
  const des = info.des
  item[des] += info.amount
  if (!item.cart && !item.order) state.bag.splice(index, 1)
}

export const operate = (state, info) => {
  let item = state.homeItemInfo.find(_item => _item.prodId === info.prodId)
  if (item) {
    for (let key in info.value) {
      item[key] = info.value[key]
    }
  } else {
    let newItem = { prodId: info.prodId, size: null, hex: null, img_i: 0, des: null }
    newItem = { ...newItem, ...info.value }
    state.homeItemInfo.push(newItem)
  }
}

export const setBuyerInfo = (state, info) => {
  state.buyer = { ...state.buyer, ...info }
}

export const toOrder = state => {
  state.bag.map(item => {
    if (item.check) {
      item.order += item.cart
      item.cart = 0
      item.check = false
    }
  })
}
export const newOrder = (state, orderedItem) => {
  state.ordered.unshift(orderedItem)
  orderedItem.items.map(_item => {
    const index = state.bag.findIndex(__item => __item.id === _item.bagid)
    state.bag[index].order = 0
    if (!state.bag[index].cart) state.bag.splice(index, 1)
  })
}

export const backToCart = (state, id) => {
  const item = state.bag.find(_item => _item._id === id)
  item.cart += item.order
  item.order = 0
}

export const toggleStar = (state, info) => {
  const i = state.star.findIndex(item => item.id === info.id)
  if (i > -1) state.star.splice(i, 1)
  else state.star.push(info)
}

export const toggleCheckAll = (state, boolean) => {
  state.bag.map(item => {
    if (item.cart) item.check = boolean
  })
}

export const toggleCheck = (state, id) => {
  const item = state.bag.find(_item => _item._id === id)
  item.check = !item.check
}

export const spliceChecked = state => {
  state.bag.reduceRight((res, item, i) => {
    if (item.check && item.cart) {
      if (!item.oder) state.bag.splice(i, 1)
      else item.cart = 0
    }
    return res++
  }, 0)
}

export const cartChangeProperty = (state, info) => {
  const existItem = state.bag.find(_item => _item._id === info.newId && _item.cart)
  if (existItem) {
    existItem.cart += info.quantity
    existItem.img_i = info.img_i
    const currentIndex = state.bag.findIndex(_item => _item._id === info.currentId)
    const currentItem = state.bag[currentIndex]
    currentItem.cart = 0
    if (!currentItem.order) state.bag.splice(currentIndex, 1)
  } else {
    const currentCartItem = state.bag.find(_item => _item._id === info.currentId && _item.cart)
    currentCartItem._id = info.newId
    currentCartItem._rev = ''
    currentCartItem.img_i = info.img_i
    currentCartItem.hex = info.hex
    currentCartItem.label = info.label
    currentCartItem.size = info.size
    currentCartItem.priceAtAdd = 0
    currentCartItem.saleAtAdd = 0
    currentCartItem.stockAtAdd = 0
    const prod = state.prods.find(_prod => _prod._id === info.prodId)
    const color = prod.colors.find(_color => _color.value === info.hex)
    if (color) {
      const size = color.sizes.find(_size => _size.size === info.size)
      if (size) {
        currentCartItem._rev = size._rev
        currentCartItem.priceAtAdd = size.price
        currentCartItem.saleAtAdd = size.sale
        currentCartItem.stockAtAdd = size.stock
      }
    }
  }
}

export const cartChangeImg = (state, info) => {
  const item = state.bag.find(_item => _item._id === info.id)
  item.img_i = info.i
}
