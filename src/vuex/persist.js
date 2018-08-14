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
    setTimeout(() => store.commit('firstTime', false), 1 * 60 * 1000)
    await set('state', state, idbstore)
  } else {
    savedState.firstTime = false
    savedState.worker = false
    savedState.imgsWorker = false
    savedState.socket = false
    store.replaceState(savedState)
  }

  store.subscribe(async (mutations, state) => {
    await set('state', state, idbstore)
  })

  if (window.Worker) {
    const worker = new WW()
    const imgWorker = new IW()
    let channel

    if (imgWorker && worker) {
      channel = new MessageChannel()
      imgWorker.postMessage({ func: 'channel', port: channel.port1 }, [channel.port1])
      worker.postMessage({ func: 'channel', port: channel.port2 }, [channel.port2])
    }

    worker.onmessage = e => {
      const data = e.data
      const commit = data.commit
      const func = data.func
      store.commit(commit, data)
      switch (func) {
        case 'all-prod':
          imgWorker.postMessage({ func: 'save', colors: e.data.data.colors })
          break
        case 'prod':
          imgWorker.postMessage({ func: 'check', colors: e.data.data.colors })
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
      store.commit('worker', { des: 'imgsWorker', value: false })
    }
  } else console.error(`worker not support!!`)
}

export default persistPlugin
