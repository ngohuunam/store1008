import { set, get } from 'idb-keyval'
import state from './state'
import WW from 'worker-loader!../ww.worker.js'

const persistPlugin = async store => {
  const savedState = await get('state')
  if (typeof savedState === 'object' && savedState !== null) {
    const mergeState = { ...store.state, ...savedState }
    store.replaceState(mergeState)
  } else await set('state', state)

  store.subscribe(async (mutations, state) => {
    await set('state', state)
  })
  const worker = new WW()
  worker.onmessage = e => {
    // console.log('worker.onmessage e.data', e.data)
    const commit = e.data.commit
    store.commit(commit, e.data)
    // console.log(store)
  }
}

export default persistPlugin
