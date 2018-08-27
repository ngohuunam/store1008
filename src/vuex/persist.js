import { Store, set, get } from 'idb-keyval'

const idbstore = new Store('vms-state')

import state from './state'

import WW from 'worker-loader!../ww.worker.js'
import IW from 'worker-loader!../iw.worker.js'

const persistPlugin = async store => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  console.log('connection', connection.type || connection.effectiveType)
  console.log('Plugin created')

  let savedState = await get('state', idbstore)
  if (!savedState) {
    setTimeout(() => store.commit('firstTime', false), 20 * 1000)
    await set('state', state, idbstore)
  } else {
    savedState.firstTime = false
    savedState.sliderData = null
    savedState.worker = false
    savedState.imgWorker = false
    savedState.socket = false
    store.replaceState(savedState)
  }

  const broadcast = new BroadcastChannel('vmBroadcast')
  let committing = false
  let worker

  store.subscribe(async (mutation, state) => {
    if (committing) return
    await set('state', state, idbstore)
    broadcast.postMessage(mutation)
    if (worker) {
      switch (mutation.type) {
        case 'pushOrdered':
        case 'login':
        case 'register':
        case 'logout':
          worker.postMessage(mutation)
      }
    }
  })

  broadcast.onmessage = e => {
    const data = e.data
    const func = data.func
    const type = data.mutation.type
    const payload = data.mutation.payload
    switch (func) {
      case 'mutation':
        committing = true
        store.commit(type, payload)
        committing = false
    }
  }

  if (window.Worker) {
    worker = new WW()
    const imgWorker = new IW()
    let channel

    if (imgWorker && worker) {
      channel = new MessageChannel()
      imgWorker.postMessage({ type: 'channel', port: channel.port1 }, [channel.port1])
      worker.postMessage({ type: 'channel', port: channel.port2 }, [channel.port2])
    }

    worker.onmessage = e => {
      const data = e.data
      const commit = data.commit
      const dispatch = data.dispatch
      const func = data.func
      if (commit) store.commit(commit, data)
      if (dispatch) store.dispatch(dispatch, data.payload)
      switch (func) {
        case 'all-prod':
          imgWorker.postMessage({ func: 'save', colors: data.data.colors })
          break
        case 'prod':
          imgWorker.postMessage({ func: 'check', colors: data.data.colors })
          break
      }
    }
    worker.onerror = () => {
      console.error('There is an error with worker!')
      store.commit('worker', { des: 'worker', value: false })
    }

    imgWorker.onmessage = e => {
      console.log('main thread onmessage data from imgWorker', e.data)
      const data = e.data
      const commit = data.commit
      store.commit(commit, data)
    }
    imgWorker.onerror = () => {
      console.error('There is an error with imgWorker!')
      store.commit('worker', { des: 'imgWorker', value: false })
    }
    document.addEventListener('visibilitychange', () => worker.postMessage({ type: 'closedByMe', value: document.hidden }), false)
  } else console.error(`worker not support!!`)
}

export default persistPlugin
