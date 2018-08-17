postMessage({ func: 'worker', commit: 'worker', des: 'worker', value: true })

import { Store, get } from 'idb-keyval'

const idbstore = new Store('vms-state')

const remote = process.env.NODE_ENV === 'production' ? 'wss://busti.club/' : 'ws://user:pass@' + location.hostname + ':5000'
let socket, reconnectWSTimeout, port, closedByMe

const connect = () => {
  fetch('https://api.ipify.org/')
    .then(res => res.text())
    .then(ip => {
      console.log(ip)
      socket = new WebSocket(remote, ip)
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
      console.log(`worker ws ${event} received data`, data)
      const func = data.func
      switch (event) {
        case 'onmessage':
          switch (func) {
            case 'connected':
              console.log('ws connected', data)
              postMessage({ func: 'socket', commit: 'socket', value: true })
              break
            case 'list':
              if (data.changed) {
                const list = data.data.value
                getProd(list)
                postMessage(data)
              } else getProd()
              break
            case 'all-prod':
              postMessage(data)
              break
            case 'prod':
              if (data.changed) postMessage(data)
              getItems(data.prodId)
              break
            default:
              if (data.changed) postMessage(data)
          }
          break
        case 'onopen':
          // console.log(`worker onopen ws`)
          if (closedByMe) closedByMe = false
          else {
            getList()
            getOrdered()
            clearTimeout(reconnectWSTimeout)
          }
          break
        case 'onclose':
          console.log('ws closed')
          postMessage({ func: 'socket', commit: 'socket', value: false })
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

const sendOrder = payload => {
  const SEND = { type: 'query', func: 'pushOrdered', term: payload }
  sksend(SEND, 'sendOrder', true)
}

const getList = () => {
  let SEND = { type: 'query', func: 'list', commit: 'fetchList', prodId: null, term: { _rev: null } }
  get('state', idbstore)
    .then(state => {
      SEND.term = state.list
    })
    .catch(e => {
      console.error('worker getList get state error:', e)
    })
    .finally(() => sksend(SEND, 'getList'))
}

const getOrdered = () => {
  let SEND = { type: 'query', func: 'order', commit: 'orderedItem', buyerId: null, buyer: null, term: [] }
  get('state', idbstore)
    .then(state => {
      SEND.term = state.ordered.length ? state.ordered : null
      SEND.buyerId = state.buyerId
      SEND.buyer = state.buyerInfo.phone && state.buyerInfo.pass ? state.buyerInfo : null
      if (SEND.term || SEND.buyer) sksend(SEND, 'getOrdered', true)
    })
    .catch(e => {
      console.error('worker getList get state error:', e)
    })
}

const getProd = list => {
  let SEND = { type: 'query', func: 'prod', commit: 'pushProd', prodId: null, term: { _rev: null } }
  get('state', idbstore)
    .then(state => {
      const LIST = list || state.list.value
      LIST.forEach(id => {
        const prod = state.prods.find(_prod => _prod._id === id)
        const rev = prod ? prod._rev : null
        SEND.prodId = id
        SEND.term._rev = rev
        sksend(SEND, 'getProd success')
      })
    })
    .catch(e => {
      console.error('worker getProd get state error:', e)
      list.forEach(id => {
        SEND.prodId = id
        sksend(SEND, 'getProd error')
      })
    })
}

const getItems = prodId => {
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
      console.error('worker getItems get state error:', e)
    })
    .finally(() => sksend(SEND, 'getItems'))
}

let closeWSTimeOut

onmessage = e => {
  const data = e.data
  const func = data.func
  switch (func) {
    case 'mutation':
      switch (data.mutation.type) {
        case 'pushOrdered':
          sendOrder(data.mutation.payload)
      }
      break
    case 'channel':
      port = data.port
      port.postMessage('Hello from ww')
      port.onmessage = e => {
        console.log('iw send mess via channel', e)
      }
      break
    case 'closedByMe':
      closedByMe = true
      if (data.value) {
        clearTimeout(closeWSTimeOut)
        if (socket && (socket.readyState === 1 || socket.readyState === 0)) closeWSTimeOut = setTimeout(() => socket.close(), 30000)
      } else {
        clearTimeout(closeWSTimeOut)
        if (socket && (socket.readyState === 2 || socket.readyState === 3)) reconnect()
      }
  }
}
