import { Store, get, set } from 'idb-keyval'
const idbstore = new Store('vms-imgs')

export const pushMess = ({ commit }, mess) => {
  const message = mess || 'Out of stock, you can place order, we will try our best'
  commit('pushMess', message)
  setTimeout(() => commit('spliceMess', 0), 5000)
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
  console.log('action saveBlob', info.key)
  return set(info.key, info.value, idbstore)
}
