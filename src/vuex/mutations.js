export const fetchList = (state, data) => {
  state.list = data.data
  if (data.removed && data.removed.length) {
    data.removed.map(name => (state.prods = state.prods.filter(prod => prod.name !== name)))
  }
}

export const pushProd = (state, messData) => {
  const data = messData.data
  let prod = state.prods.length ? state.prods.find(_prod => _prod.name === data._id) : null
  if (prod) prod = { ...prod, ...data }
  else state.prods.push(data)
}

export const pushColor = (state, messData) => {
  const datas = messData.datas
  const prod = state.prods.find(_prod => _prod._id === datas[0].prod)
  if (prod) {
    datas.map(color => {
      let currentColor = prod.colors.find(_color => _color._id === color._id)
      if (currentColor) currentColor = color
      else prod.colors.push(color)
    })
  }
}

export const pushItem = (state, messData) => {
  const datas = messData.datas
  const prod = state.prods.find(_prod => _prod._id === datas[0].prod)
  if (prod) {
    datas.map(_d => {
      const color = prod.colors.find(color => color._id === _d.colors)
      if (color) {
        let currentSize = color.sizes.find(size => size._id === _d._id)
        if (currentSize) currentSize = _d
        else color.sizes.push(_d)
      }
    })
  }
}

export const pushMess = (state, mess) => {
  state.mess.push(mess)
}

export const spliceMess = (state, i) => {
  state.mess.splice(i, 1)
}

export const pushBag = (state, item) => {
  state.bag.push(item)
}

export const change = (state, info) => {
  const index = state.bag.findIndex(item => item.id === info.id)
  const item = state.bag[index]
  const des = info.des
  item[des] += info.amount
  if (!item.cart && !item.order) state.bag.splice(index, 1)
}

export const operate = (state, info) => {
  let item = state.homeItemInfo.find(_item => _item.name === info.name)
  if (item) {
    const key = Object.keys(info.value)[0]
    item[key] = info.value[key]
  } else {
    let newItem = { name: info.name, size: null, hex: null, des: null }
    newItem = { ...newItem, ...info.value }
    state.homeItemInfo.push(newItem)
  }
}

export const setBuyerInfo = (state, info) => {
  state.buyerInfo = { ...state.buyerInfo, ...info }
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
export const pushOrdered = (state, orderedItem) => {
  state.ordered.unshift(orderedItem)
  orderedItem.items.map(_item => {
    const index = state.bag.findIndex(__item => __item.id === _item.id)
    state.bag[index].order = 0
    if (!state.bag[index].cart) state.bag.splice(index, 1)
  })
}

export const backToCart = (state, id) => {
  const item = state.bag.find(_item => _item.id === id)
  item.cart += item.order
  item.order = 0
}

export const toggleStar = (state, info) => {
  const i = state.star.findIndex(item => item.id === info.id)
  if (i > -1) state.star.splice(i, 1)
  else state.star.push(info)
}

export const toggleCheckAll = (state, boolean) => {
  state.bag.map(item => (item.check = boolean))
}

export const toggleCheck = (state, id) => {
  const item = state.bag.find(_item => _item.id === id)
  item.check = !item.check
}

export const spliceChecked = state => {
  state.bag.map(item => {
    if (item.check) {
      item.cart = 0
    }
  })
}

export const cartChangeProperty = (state, info) => {
  const existItem = state.bag.find(_item => _item.id === info.newId)
  if (existItem) {
    existItem.cart += info.quantity
    const currentIndex = state.bag.findIndex(_item => _item.id === info.currentId)
    const currentItem = state.bag[currentIndex]
    currentItem.cart = 0
    if (!currentItem.order && !currentItem.ordered) state.bag.splice(currentIndex, 1)
  } else {
    const currentItem = state.bag.find(_item => _item.id === info.currentId)
    currentItem.hex = info.hex
    currentItem.size = info.size
    currentItem.id = info.newId
  }
}
