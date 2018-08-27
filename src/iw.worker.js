postMessage({ func: 'worker', commit: 'worker', des: 'imgWorker', value: true })

import { Store, get, set } from 'idb-keyval'
const idbstore = new Store('vms-imgs')
let port
const remote = 'https://res.cloudinary.com/dgprt0eay/image/upload/'

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
  color.imgs.forEach(pid => {
    get(pid, idbstore)
      .then(() => handleResult({ task: 'checkImg', status: 'ok', prod: color.prod, hex: color.value, key: pid }))
      .catch(e => {
        handleError({ task: 'checkImg', status: 'get keyvalue error', e: e, prod: color.prod, hex: color.value, key: pid })
        saveImg(color)
      })
  })
}

const saveImg = color => {
  color.imgs.forEach(pid => {
    const url = remote + pid
    fetchURL(url)
      .then(blob => {
        saveBlob(pid, color.prod, color.value, blob)
          .then(key => handleResult({ task: 'saveImg', status: 'ok', prod: color.prod, hex: color.value, key: key }))
          .catch(e => handleError({ task: 'saveBlob', status: 'error', e: e, prod: color.prod, hex: color.value, pid: pid }))
      })
      .catch(e => handleError({ task: 'fetchURL', status: 'error', e: e, prod: color.prod, hex: color.value, url: url }))
  })
}

const saveImgs = colors => {
  colors.forEach(color => saveImg(color))
}

const saveBlob = (pid, prod, hex, blob) => {
  return new Promise((resolve, reject) => {
    const value = { prod: prod, hex: hex, blob: blob }
    set(pid, value, idbstore)
      .then(() => resolve(pid))
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
