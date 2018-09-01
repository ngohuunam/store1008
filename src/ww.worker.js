self.postMessage({ commit: 'setState', payload: { des: 'worker', value: true } })

import { Store, get } from 'idb-keyval'

const idbstore = new Store('vms-state')

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

const connect = () => {
  self.postMessage({ commit: 'setStateArray', payload: { des: 'mess', key: 'id', value: { text: 'Connecting to server...', id: 'connecting' } } })
  get('state', idbstore)
    .then(state => {
      protocol = state.buyer._id || state.buyer.phone || protocol
    })
    .catch(e => console.error('[worker buyerId get state error:]', e))
    .finally(() => {
      socket = new WebSocket(remote, protocol)
      onEvent()
    })
}

const reconnect = () => {
  self.postMessage({ commit: 'setStateArray', payload: { des: 'mess', key: 'id', value: { text: 'Reconnecting to server...', id: 'connecting' } } })
  clearTimeout(reconnectWSTimeout)
  reconnectWSTimeout = setTimeout(() => {
    connect()
    // onEvent()
  }, 3000)
}

const onEvent = () => {
  ;['onmessage', 'onclose', 'onerror', 'onopen'].forEach(event => {
    socket[event] = mess => {
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
              syncProds(data.list)
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
              syncItems(data.prodId)
              break

            default:
              self.postMessage(data)
          }
          break

        case 'onopen':
          // console.log(`worker onopen ws`)
          self.postMessage({ commit: 'pushState', payload: { des: 'mess', value: { text: `Get list of products,...`, color: 'cyan' } } })
          syncList()
          syncOrdered()
          clearTimeout(reconnectWSTimeout)
          break

        case 'onclose':
          console.log('ws closed')
          self.postMessage({ commits: ['setState', 'setStateArray'], payload: [{ des: 'socket', value: false }, { des: 'mess', value: { text: 'Not connecting to server!', id: 'connecting' } }] })
          if (!closedByMe) {
            reconnect()
          }
      }
    }
  })
}
connect()
// onEvent()

//eslint-disable-next-line
const sksend = (SEND, func, printConsole) => {
  SEND = JSON.stringify(SEND)
  if (printConsole) console.log(`worker ${func} send ws mess:`, SEND)
  socket.send(SEND)
}

const newOrder = payload => {
  const query = { func: 'newOrder', payload: payload }
  sksend(query, 'newOrder', true)
}

const syncList = () => {
  let query = { func: 'list', payload: { _rev: null } }
  get('state', idbstore)
    .then(state => (query.payload = state.list))
    .catch(e => console.error('worker syncList get state error:', e))
    .finally(() => sksend(query, 'syncList'))
}

const syncOrdered = () => {
  let query = { func: 'syncOrdered', buyer: null, payload: [] }
  get('state', idbstore)
    .then(state => {
      query.payload = state.ordered.length ? state.ordered : []
      query.buyer = state.buyer._id && state.buyer.phone && state.buyer.pass ? state.buyer : null
      if (query.payload.length || query.buyer) sksend(query, 'syncOrdered', false)
    })
    .catch(e => console.error('worker syncOrdered get state error:', e))
}

const syncProds = list => {
  let query = { func: 'syncProd', payload: { _rev: null, prodId: null } }
  get('state', idbstore)
    .then(state => {
      const LIST = list || state.list.value
      LIST.forEach(id => {
        const prod = state.prods.find(_prod => _prod._id === id)
        const rev = prod ? prod._rev : null
        query.payload.prodId = id
        query.payload._rev = rev
        sksend(query, 'syncProds success')
      })
    })
    .catch(e => {
      console.error('worker syncProds get state error:', e)
      if (list && list.length) {
        list.forEach(id => {
          query.prodId = id
          sksend(query, 'syncProds error')
        })
      } else {
        syncList()
        syncOrdered()
      }
    })
}

const syncItems = prodId => {
  const SEND = { func: 'syncItems', payload: { prodId: prodId, term: [] } }
  get('state', idbstore)
    .then(state => {
      const prod = state.prods.find(_prod => _prod._id === prodId)
      if (prod && prod.colors.length) {
        prod.colors.map(color => {
          color.sizes.map(size => {
            SEND.payload.term.push({ id: size._id, rev: size._rev })
          })
        })
      }
    })
    .catch(e => console.error('worker syncItems get state error:', e))
    .finally(() => sksend(SEND, 'syncItems', false))
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
      sksend({ func: type, payload: data.payload }, type, true)
      break
    case 'pushOrdered':
      newOrder(data.payload)
      break
    case 'channel':
      console.log('ww data.port', data.port)
      port = data.port
      port.postMessage('Hello from ww')
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
