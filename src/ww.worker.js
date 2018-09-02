self.postMessage({ commit: 'setState', payload: { des: 'worker', value: true } })
import { IDStore, getKey } from 'idb-keyval'

const idbstore = new IDStore('vms-state')

const remote = process.env.NODE_ENV === 'production' ? 'wss://busti.club/' : 'ws://' + location.hostname + ':5000'
let socket, reconnectWSTimeout, port, closedByMe

const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`
}

let protocol = guid()
const connect = async () => {
  self.postMessage({ commit: 'setStateArray', payload: { des: 'mess', key: 'id', value: { text: 'Connecting to server...', id: 'connecting' } } })
  try {
    const state = await getKey('state', idbstore)
    if (state) protocol = state.buyer._id || state.buyer.phone || protocol
  } catch (e) {
    self.postMessage({ dispatch: 'pushMess', payload: { text: `connect error: ${e.message}` } })
  } finally {
    socket = new WebSocket(remote, protocol)
    onEvent()
  }
}

connect()

const reconnect = () => {
  self.postMessage({ commit: 'setStateArray', payload: { des: 'mess', key: 'id', value: { text: 'Reconnecting to server...', id: 'connecting' } } })
  clearTimeout(reconnectWSTimeout)
  reconnectWSTimeout = setTimeout(() => {
    connect()
  }, 3000)
}

const onEvent = () => {
  ;['onmessage', 'onclose', 'onerror', 'onopen'].forEach(event => {
    socket[event] = async mess => {
      const data = mess.data ? JSON.parse(mess.data) : { func: null }
      console.log(`[socket ${event} received]`, data)
      const func = data.func
      switch (event) {
        case 'onmessage':
          switch (func) {
            case 'connected':
              console.log('ws connected', data)
              self.postMessage({ commit: 'setState', payload: { des: 'socket', value: true }, dispatch: 'changeMess', dispatchPayload: { text: 'Online!!', color: 'green', id: 'connecting' } })
              break

            case 'sync-prods':
              self.postMessage(data)
              await syncProds(data.list)
              break

            case 'push-prod':
              if (port) port.postMessage({ func: 'fetch', colors: data.payload.value.colors })
              else data.func = 'iw-fetch'
              self.postMessage(data)
              break

            case 'set-prod':
              if (port) port.postMessage({ func: 'check', colors: data.payload.value.colors })
              else data.func = 'iw-check'
              self.postMessage(data)
              break

            case 'sync-items':
              await syncItems(data.prodId)
              break

            default:
              self.postMessage(data)
          }
          break

        case 'onopen':
          self.postMessage({ commit: 'pushState', payload: { des: 'mess', value: { text: `Get list of products,...`, color: 'cyan' } } })
          await syncList()
          await syncOrdered()
          clearTimeout(reconnectWSTimeout)
          break

        case 'onclose':
          self.postMessage({ commits: ['setState', 'setStateArray'], payload: [{ des: 'socket', value: false }, { des: 'mess', value: { text: 'Not connecting to server!', id: 'connecting' } }] })
          if (!closedByMe) reconnect()
      }
    }
  })
}

//eslint-disable-next-line
const sksend = (SEND, func, printConsole) => {
  SEND = JSON.stringify(SEND)
  if (printConsole) console.log(`worker ${func} send ws mess:`, SEND)
  socket.send(SEND)
}

const syncList = async () => {
  try {
    let query = { func: 'list', payload: { _rev: null } }
    const state = await getKey('state', idbstore)
    if (state) {
      query.payload = state.list
      sksend(query, 'syncList', false)
    }
  } catch (e) {
    self.postMessage({ dispatch: 'pushMess', payload: { text: `syncList error: ${e.message}` } })
  }
}

const syncOrdered = async () => {
  try {
    let query = { func: 'syncOrdered', payload: { new: [], buyer: null } }
    const state = await getKey('state', idbstore)
    if (state) {
      query.payload.new = state.ordered.filter(item => !item.status.received)
      query.payload.buyer = state.buyer._id && state.buyer.phone && state.buyer.pass ? state.buyer : null
      if (query.payload.buyer) sksend(query, 'syncOrdered', false)
    }
  } catch (e) {
    self.postMessage({ dispatch: 'pushMess', payload: { text: `syncOrdered error: ${e.message}` } })
  }
}

const syncProds = async list => {
  try {
    let query = { func: 'syncProd', payload: { _rev: null, prodId: null } }
    const state = await getKey('state', idbstore)
    if (state) {
      const LIST = list || state.list.value
      LIST.forEach(id => {
        const prod = state.prods.find(_prod => _prod._id === id)
        const rev = prod ? prod._rev : null
        query.payload.prodId = id
        query.payload._rev = rev
        sksend(query, 'syncProds success')
      })
    } else {
      if (list && list.length) {
        list.forEach(id => {
          query.prodId = id
          sksend(query, 'syncProds error')
        })
      } else {
        await syncList()
        await syncOrdered()
      }
    }
  } catch (e) {
    self.postMessage({ dispatch: 'pushMess', payload: { text: `syncProds error: ${e.message}` } })
  }
}

const syncItems = async prodId => {
  try {
    const SEND = { func: 'syncItems', payload: { prodId: prodId, term: [] } }
    const state = await getKey('state', idbstore)
    if (state) {
      const prod = state.prods.find(_prod => _prod._id === prodId)
      if (prod && prod.colors.length) {
        prod.colors.map(color => {
          color.sizes.map(size => {
            SEND.payload.term.push({ id: size._id, rev: size._rev })
          })
        })
      }
      sksend(SEND, 'syncItems', false)
    }
  } catch (e) {
    self.postMessage({ dispatch: 'pushMess', payload: { text: `syncOrdered error: ${e.message}` } })
  }
}

let closeWSTimeOut

self.onmessage = e => {
  const data = e.data
  const type = data.type
  switch (type) {
    case 'logout':
      data.payload = guid()
    //eslint-disable-next-line
    case 'register':
    case 'login':
    case 'newOrder':
      sksend({ func: type, payload: data.payload }, type, true)
      break
    case 'channel':
      port = data.port
      port.onmessage = e => console.log('iw send mess via channel', e)
      break
    case 'closedByMe':
      closedByMe = true
      if (data.value) {
        clearTimeout(closeWSTimeOut)
        if (socket && (socket.readyState === 1 || socket.readyState === 0)) closeWSTimeOut = setTimeout(() => socket.close(), 10 * 60 * 1000)
      } else {
        clearTimeout(closeWSTimeOut)
        if (socket && (socket.readyState === 2 || socket.readyState === 3)) reconnect()
      }
  }
}
