import { Store, get, set } from 'idb-keyval'
const idbstore = new Store('vms-imgs')

export const pushMess = ({ commit }, mess) => {
  const message = mess || { text: 'Out of stock, you can place order, we will try our best' }
  commit('pushState', { des: 'mess', value: message })
  setTimeout(() => commit('spliceState', { des: 'mess', index: 0 }), 5000)
}

export const getBlob = (context, key) => {
  return new Promise((resolve, reject) => {
    get(key, idbstore)
      .then(value => {
        const blob = value.blob
        resolve(blob)
      })
      .catch(e => reject(e))
  })
}

export const saveBlob = (context, info) => {
  return set(info.key, info.value, idbstore)
}
