import { IDStore, setKey, getKey } from 'idb-keyval'

const idbstore = new IDStore('vms-state')

import state from './state'

const persistPlugin = async store => {
  store.commit('pushState', { des: 'mess', value: { text: 'Init...', color: 'green', id: 'init' } })
  let savedState = await getKey('state', idbstore)
  if (!savedState) {
    setTimeout(() => store.commit('setState', { des: 'firstTime', value: false }), 20 * 1000)
    await setKey('state', state, idbstore)
  } else {
    savedState.firstTime = false
    savedState.loader = false
    savedState.sliderData = null
    savedState.worker = false
    savedState.imgWorker = false
    savedState.socket = false
    savedState.broadcastChannel = false
    savedState.messageChannel = false
    store.replaceState(savedState)
  }
  // const BroadcastChannel = require('broadcast-channel')
  const broadcast = new BroadcastChannel('vmBroadcast') || null
  let committing = false
  let worker, imgWorker, channel

  store.subscribe(async (mutation, state) => {
    if (committing) return
    await setKey('state', state, idbstore)
    if (broadcast) broadcast.postMessage(mutation)
    if (worker) {
      switch (mutation.type) {
        case 'newOrder':
        case 'login':
        case 'register':
        case 'logout':
          worker.postMessage(mutation)
      }
    }
  })

  if (broadcast) {
    store.commit('setState', { des: 'broadcastChannel', value: true })
    // console.log('init BroadcastChannel ' + broadcast)
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
  }

  if (window.Worker) {
    const WW = require('worker-loader!../ww.worker.js')
    const IW = require('worker-loader!../iw.worker.js')
    worker = new WW()
    imgWorker = new IW()
  }

  if (!imgWorker) {
    const PseudoWorker = require('pseudo-worker')
    imgWorker = new PseudoWorker('../iw.worker.js')
  }

  if (!worker) {
    const PseudoWorker = require('pseudo-worker')
    worker = new PseudoWorker('../ww.worker.js')
  }

  if (imgWorker && worker) {
    channel = new MessageChannel() || null
    if (channel) {
      store.commit('setState', { des: 'messageChannel', value: true })
      // console.log('init MessageChannel ' + channel)
      imgWorker.postMessage({ func: 'channel', port: channel.port1 }, [channel.port1])
      worker.postMessage({ type: 'channel', port: channel.port2 }, [channel.port2])
    }

    worker.onmessage = e => {
      const data = e.data
      const commit = data.commit
      const commits = data.commits
      const dispatch = data.dispatch
      const payload = data.payload
      const func = data.func
      if (commit) store.commit(commit, payload)
      else if (commits) commits.map((_commit, i) => store.commit(_commit, payload[i]))
      if (dispatch) store.dispatch(dispatch, data.dispatchPayload)
      if (!channel && func) {
        switch (func) {
          case 'iw-fetch':
            imgWorker.postMessage({ func: 'fetch', colors: payload.value.colors })
            break
          case 'iw-check':
            imgWorker.postMessage({ func: 'check', colors: payload.value.colors })
            break
        }
      }
    }
    worker.onerror = e => {
      console.error('worker error ' + e.message)
      store.commit('setState', { des: 'worker', value: false })
    }

    imgWorker.onmessage = e => {
      const data = e.data
      const dispatch = data.dispatch
      const commit = data.commit
      if (dispatch) store.dispatch(dispatch, data.payload)
      if (commit) store.commit(commit, data.payload)
    }

    imgWorker.onerror = e => {
      console.error('imgWorker error ' + e.message)
      store.commit('setState', { des: 'imgWorker', value: false })
    }
    document.addEventListener('visibilitychange', () => worker.postMessage({ type: 'closedByMe', value: document.hidden }), false)
  } else store.commit('pushState', { des: 'mess', value: { text: `Your browser doesn't supported, pls use chrome instead` } })
  store.commit('spliceState', { des: 'mess', key: 'id', value: 'init' })
}

export default persistPlugin
