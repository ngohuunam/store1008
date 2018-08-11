import { get } from 'idb-keyval'

const remote = 'ws://192.168.1.200:5000'
// const remote = 'ws://192.168.2.190:5000'
let socket = new WebSocket(remote)
let timeout
//eslint-disable-next-line
let count = 1

const connect = () => {
  socket = new WebSocket(remote)
}

const reconnect = () => {
  count++
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
      // console.log('data', data)
      const func = data.func
      switch (event) {
        case 'onmessage':
          switch (func) {
            case 'list':
              if (data.changed) {
                const list = data.data.value
                postMessage(data)
                getProd(list)
              } else getProd()
              break
            case 'prod':
              if (data.changed) postMessage(data)
              getColors(data.prodId)
              break
            case 'colors':
              if (data.changed) postMessage(data)
              getItems(data.prodId)
              break
            case 'items':
              if (data.changed) postMessage(data)
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
  // console.log(`worker getColors send ws mess:`, SEND)
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
