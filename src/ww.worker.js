postMessage({ commit: 'setState', payload: { des: 'worker', value: true } })

import { Store, get } from 'idb-keyval'

const idbstore = new Store('vms-state')

// const remote = process.env.NODE_ENV === 'production' ? 'wss://busti.club/' : 'ws://' + location.hostname + ':5000'
const remote = 'ws://127.0.0.1:5000'
let socket, reconnectWSTimeout, port, closedByMe, protocol

const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`
}

protocol = guid()

const connect = () => {
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
  console.log('reconnect')
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
              postMessage({ commit: 'setState', payload: { des: 'socket', value: true } })
              break
            case 'all-prod':
              postMessage(data)
              break
            case 'syncProds':
              console.log(data.list)
              syncProds(data.list)
              break
            case 'syncItems':
              syncItems(data.prodId)
              break
            default:
              if (data.changed) postMessage(data)
          }
          break
        case 'onopen':
          // console.log(`worker onopen ws`)
          syncList()
          syncOrdered()
          clearTimeout(reconnectWSTimeout)
          break
        case 'onclose':
          console.log('ws closed')
          postMessage({ commit: 'setState', payload: { des: 'socket', value: true } })
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
  let query = { func: 'list', prodId: null, term: { _rev: null } }
  get('state', idbstore)
    .then(state => (query.term = state.list))
    .catch(e => console.error('worker syncList get state error:', e))
    .finally(() => sksend(query, 'syncList'))
}

const syncOrdered = () => {
  let query = { func: 'syncOrdered', buyer: null, term: [] }
  get('state', idbstore)
    .then(state => {
      query.term = state.ordered.length ? state.ordered : []
      query.buyer = state.buyer._id && state.buyer.phone && state.buyer.pass ? state.buyer : null
      if (query.term.length || query.buyer) sksend(query, 'syncOrdered', false)
    })
    .catch(e => console.error('worker syncOrdered get state error:', e))
}

const syncProds = list => {
  let query = { func: 'prod', prodId: null, term: { _rev: null } }
  get('state', idbstore)
    .then(state => {
      const LIST = list || state.list.value
      LIST.forEach(id => {
        const prod = state.prods.find(_prod => _prod._id === id)
        const rev = prod ? prod._rev : null
        query.prodId = id
        query.term._rev = rev
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
  const SEND = { type: 'query', func: 'items', commit: 'loopItems', prodId: prodId, term: [] }
  get('state', idbstore)
    .then(state => {
      const prod = state.prods.find(_prod => _prod._id === prodId)
      if (prod && prod.colors.length) {
        prod.colors.map(color => {
          color.sizes.map(size => {
            SEND.term.push({ id: size._id, rev: size._rev })
          })
        })
      }
    })
    .catch(e => {
      console.error('worker syncItems get state error:', e)
    })
    .finally(() => sksend(SEND, 'syncItems', false))
}

let closeWSTimeOut

onmessage = e => {
  const data = e.data
  const type = data.type
  switch (type) {
    case 'register':
    case 'login':
      sksend({ func: type, payload: data.payload }, type, true)
      break
    case 'logout':
      if (protocol === data.payload) protocol = guid()
      sksend({ func: 'logout', payload: data.payload, protocol: protocol }, 'logout', true)
      break
    case 'pushOrdered':
      newOrder(data.payload)
      break
    case 'channel':
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
