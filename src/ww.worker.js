postMessage({ func: 'worker', commit: 'worker', des: 'worker', value: true })

import { Store, get } from 'idb-keyval'

const idbstore = new Store('vms-state')

const remote = process.env.NODE_ENV === 'production' ? 'wss://busti.club/' : 'ws://51.15.68.18'
// const remote = 'wss://192.168.1.200:5000'
// const remote = 'wss://busti.club/'
let socket
let timeout
let count = 1
let port

const connect = () => {
  socket = new WebSocket(remote)
}

const reconnect = () => {
  count = count + 1
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    connect()
    onEvent()
  })
}

const onEvent = () => {
  ;['onmessage', 'onclose', 'onerror', 'onopen'].forEach(event => {
    socket[event] = mess => {
      const data = mess.data ? JSON.parse(mess.data) : { func: null }
      // console.log('worker websocket received data', data)
      const func = data.func
      switch (event) {
        case 'onmessage':
          switch (func) {
            case 'connected':
              console.log('sw connected', data)
              postMessage({ func: 'socket', commit: 'socket', value: true })
              break
            case 'list-imgs':
              port.postMessage({ func: 'check', list: data.data.value })
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
          getList()
          count = 1
          clearTimeout(timeout)
          break
        case 'onclose':
          postMessage({ func: 'socket', commit: 'socket', value: false })
          reconnect()
      }
    }
  })
}
connect()
onEvent()

//eslint-disable-next-line
const sksend = (SEND, func) => {
  SEND = JSON.stringify(SEND)
  // console.log(`worker ${func} send ws mess:`, SEND)
  socket.send(SEND)
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
  const SEND = { type: 'query', func: 'items', commit: 'pushItem', prodId: prodId, term: [] }
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

onmessage = e => {
  const data = e.data
  const func = data.func
  switch (func) {
    case 'channel':
      port = data.port
      port.postMessage('Hello from ww')
      port.onmessage = e => {
        console.log('iw send mess via channel', e)
      }
  }
}
