postMessage({ func: 'worker', commit: 'worker', des: 'imgsWorker', value: true })

import { Store, get, set } from 'idb-keyval'
const idbstore = new Store('vms-imgs')
let port

onmessage = e => {
  // console.log('img worker data from message', e)
  const func = e.data.func
  const colors = e.data.colors
  switch (func) {
    case 'channel':
      port = e.data.port
      port.postMessage('Hello from iw')
      port.onmessage = e => {
        console.log('ww send mess via channel', e)
      }
      break
    case 'save':
      saveImgs(colors)
      break
    case 'check':
      checkImgs(colors)
  }
}

const handleResult = info => {
  // postMessage(JSON.stringify(info))
  console.log(info)
}

const handleError = info => {
  // postMessage(JSON.stringify(info))
  console.error(info)
}

const checkImgs = colors => {
  colors.forEach(color => checkImg(color))
}

const checkImg = color => {
  color.imgs.forEach(url => {
    const from = url.lastIndexOf('/') + 1
    const to = url.lastIndexOf('.')
    const key = url.slice(from, to)
    get(key, idbstore)
      .then(value => {
        const savedBlob = value.blob
        const saveReader = new FileReader()
        let savedBlobAsText
        saveReader.onload = () => {
          savedBlobAsText = saveReader.result
        }
        saveReader.readAsText(savedBlob)

        fetchURL(url)
          .then(blob => {
            let fetchBlobAsText
            const reader = new FileReader()
            reader.onload = () => {
              fetchBlobAsText = reader.result
            }
            reader.readAsText(blob)
            if (savedBlobAsText === fetchBlobAsText) {
              handleResult({ task: 'checkImg', status: 'ok', prod: color.prod, hex: color.value, key: key })
            } else
              saveBlob(color.id, blob, url)
                .then(_key => handleResult({ task: 'checkImg', status: 'saveBlob ok', prod: color.prod, hex: color.value, _key: _key, key: key }))
                .catch(e => handleError({ task: 'checkImg', status: 'saveBlob error', e: e, prod: color.prod, hex: color.value, key: key }))
          })
          .catch(e => handleError({ task: 'checkImg', status: 'error', e: e, prod: color.prod, hex: color.value, key: key }))
      })
      .catch(e => {
        handleError({ task: 'checkImg', status: 'get keyvalue error', e: e, prod: color.prod, hex: color.value, key: key })
        saveImg(color)
      })
  })
}

const saveImg = color => {
  color.imgs.forEach(url => {
    fetchURL(url)
      .then(blob => {
        saveBlob(color.id, blob, url)
          .then(key => handleResult({ task: 'saveImg', status: 'ok', prod: color.prod, hex: color.value, key: key }))
          .catch(e => handleError({ task: 'saveBlob', status: 'error', e: e, prod: color.prod, hex: color.value, url: url }))
      })
      .catch(e => handleError({ task: 'fetchURL', status: 'error', e: e, prod: color.prod, hex: color.value, url: url }))
  })
}

const saveImgs = colors => {
  colors.forEach(color => saveImg(color))
}

const saveBlob = (id, blob, url) => {
  return new Promise((resolve, reject) => {
    const from = url.lastIndexOf('/') + 1
    const to = url.lastIndexOf('.')
    const key = url.slice(from, to)
    const value = { id: id, blob: blob, url: url }
    set(key, value, idbstore)
      .then(() => resolve(key))
      .catch(e => reject('set keyvalue error: ' + e))
  })
}

const fetchURL = url => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        return response.blob()
      })
      .then(blob => resolve(blob))
      .catch(e => reject('fetch error: ' + e))
  })
}
