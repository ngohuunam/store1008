import { get } from 'idb-keyval'

const remote = 'ws://192.168.1.200:5000'
// const remote = 'ws://192.168.2.190:5000'
let socket = new WebSocket(remote)
let timeout
let count = 1

const connect = () => {
  // postMessage(JSON.stringify({ type: 'socket', event: 'connect' }))
  socket = new WebSocket(remote)
}

const reconnect = () => {
  // postMessage(JSON.stringify({ type: 'socket', event: 'reconnect', count }))
  count = count + 1
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    connect()
    onEvent()
  })
}

const post = (ports, data) => {
  ports.forEach(port => port.postMessage(data))
}

const onEvent = () => {
  ;['onmessage', 'onclose', 'onerror', 'onopen'].forEach(event => {
    socket[event] = mess => {
      const data = mess.data ? JSON.parse(mess.data) : { func: null }
      console.log('data', data)
      const func = data.func
      switch (event) {
        case 'onmessage':
          switch (func) {
            case 'list':
              if (data.changed) {
                const list = data.data.value
                post(data)
                getProd(list)
              } else getProd()
              break
            case 'prod':
              if (data.changed) post(data)
              getColors(data.prodId)
              break
            case 'colors':
              if (data.changed) post(data)
              getItems(data.prodId)
              break
            case 'items':
              if (data.changed) post(data)
          }
          break
        case 'onopen':
          getList()
          count = 1
          clearTimeout(timeout)
          break
        case 'onclose':
          reconnect()
      }
    }
  })
}

onEvent()

const sksend = SEND => {
  SEND = JSON.stringify(SEND)
  console.log(`worker getColors send ws mess:`, SEND)
  socket.send(SEND)
}

const getList = () => {
  get('state').then(state => {
    const SEND = { type: 'query', func: 'list', commit: 'fetchList', prodId: null, term: state.list }
    sksend(SEND)
  })
}

const getProd = list => {
  let SEND = { type: 'query', func: 'prod', commit: 'pushProd', prodId: null, term: { _rev: null } }
  get('state')
    .then(state => {
      const LIST = list || state.list.value
      LIST.forEach(id => {
        const prod = state.prods.find(_prod => _prod._id === id)
        const rev = prod ? prod._rev : null
        SEND.prodId = id
        SEND.term._rev = rev
        sksend(SEND)
      })
    })
    .catch(() =>
      list.forEach(id => {
        SEND.prodId = id
        sksend(SEND)
      }),
    )
}

const getColors = prodId => {
  get('state').then(state => {
    const prod = state.prods.find(_prod => _prod._id === prodId)
    let term = []
    if (prod && prod.colors.length) {
      term = prod.colors.map(color => {
        return { id: color._id, rev: color._rev }
      })
    }
    const SEND = { type: 'query', func: 'colors', commit: 'pushColor', prodId: prodId, term: term }
    sksend(SEND)
  })
}

const getItems = prodId => {
  get('state').then(state => {
    const prod = state.prods.find(_prod => _prod._id === prodId)
    let term = []
    if (prod && prod.colors.length) {
      prod.colors.map(color => {
        color.sizes.map(size => {
          term.push({ id: size._id, rev: size._rev })
        })
      })
    }
    const SEND = { type: 'query', func: 'items', commit: 'pushItem', prodId: prodId, term: term }
    sksend(SEND)
  })
}

let ports = []

self.addEventListener('connect', function(evt) {
  console.log('worker connect')
  // Add the port to the list of connected clients
  const port = evt.ports[0]
  ports.push(port)
  port.start()

  port.addEventListener('message', function(e) {
    console.log('port.onmessage', e)
  })
  // Start the worker.
})
