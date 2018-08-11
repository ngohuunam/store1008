import { set, get } from 'idb-keyval'
import state from './state'
import SW from '../sw.js'

const plugin = async store => {
  const savedState = await get('state')
  if (typeof savedState === 'object' && savedState !== null) {
    const mergeState = { ...store.state, ...savedState }
    store.replaceState(mergeState)
  } else await set('state', state)

  store.subscribe(async (mutations, state) => {
    await set('state', state)
  })

  const worker = new SW()
  console.log('worker', worker)
  worker.port.postMessage('ok')
  worker.port.onmessage = e => {
    console.log('worker.onmessage e.data', e.data)
    const commit = e.data.commit
    store.commit(commit, e.data)
    // console.log(store)
  }

  worker.onerror = function(err) {
    console.log(err.message)
    // worker.port.close()
  }

  worker.port.start()
}

export default plugin
