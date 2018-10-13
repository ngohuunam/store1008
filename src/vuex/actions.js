import { IDStore, getKey, setKey } from 'idb-keyval'
const idbstore = new IDStore('vms-imgs')

export const pushMess = ({ commit }, mess) => {
  const message = mess || { text: 'Out of stock, you can place order, we will try our best' }
  const timeout = setTimeout(() => commit('spliceState', { des: 'mess', index: 0 }), 5000)
  commit('pushState', { des: 'mess', value: message, timeout: timeout })
}

export const changeMess = ({ state, commit }, mess) => {
  let index = mess.index
  if (index === undefined) index = state.mess.findIndex(m => m.id === mess.id)
  const timeout = setTimeout(() => commit('spliceState', { des: 'mess', index: index }), 5000)
  if (index > -1) {
    const currentTimeOut = state.mess[index].timeout
    clearTimeout(currentTimeOut)
    commit('setStateArray', { des: 'mess', key: 'id', value: mess, timeout: timeout })
  } else {
    commit('pushState', { des: 'mess', value: mess })
    setTimeout(() => commit('spliceState', { des: 'mess', key: 'id', value: mess.id, timeout: timeout }), 5000)
  }
}

export const getBlob = (context, key) => {
  return new Promise((resolve, reject) => {
    getKey(key, idbstore)
      .then(value => {
        if (value) {
          const blob = value.blob
          resolve(blob)
        } else reject(value)
      })
      .catch(e => reject(e))
  })
}

export const saveBlob = (context, info) => {
  return setKey(info.key, info.value, idbstore)
}
