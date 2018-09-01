self.postMessage({ commit: 'setState', payload: { des: 'imgWorker', value: true } })

import { Store, get, set } from 'idb-keyval'
const idbstore = new Store('vms-imgs')
let port
const remote = 'https://res.cloudinary.com/dgprt0eay/image/upload/'

self.onmessage = e => {
  // console.log('img worker data from message', e)
  const func = e.data.func
  const colors = e.data.colors
  switch (func) {
    case 'channel':
      console.log('iw data.port', e.data.port)
      port = e.data.port
      port.postMessage('Hello from iw')
      port.onmessage = e => {
        console.log('ww send mess via channel', e.data)
        switch (e.data.func) {
          case 'fetch':
            saveImgsByColors(e.data.colors)
            break
          case 'check':
            checkImgsByColors(e.data.colors)
        }
      }
      break
    case 'fetch':
      saveImgsByColors(colors)
      break
    case 'check':
      checkImgsByColors(colors)
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

const checkImgsByColors = colors => {
  colors.forEach(color => checkImgsByColor(color))
}

const checkImgsByColor = color => {
  color.imgs.forEach(pid => {
    get(pid, idbstore)
      .then(() => handleResult({ task: 'checkImg', status: 'ok', prod: color.prod, hex: color.value, key: pid }))
      .catch(e => {
        handleError({ task: 'checkImg', status: 'get keyvalue error', e: e, prod: color.prod, hex: color.value, key: pid })
        saveImgByPid(pid, color.prod, color.value)
      })
  })
}

const saveImgByPid = (pid, prodId, hex) => {
  const url = remote + pid
  fetchURL(url)
    .then(blob => {
      saveBlob(pid, prodId, hex, blob)
        .then(key => handleResult({ task: 'saveImg', status: 'ok', prod: prodId, hex: hex, key: key }))
        .catch(e => handleError({ task: 'saveBlob', status: 'error', e: e, prod: prodId, hex: hex, pid: pid }))
    })
    .catch(e => handleError({ task: 'fetchURL', status: 'error', e: e, prod: prodId, hex: hex, url: url }))
}

const saveImgsByColor = color => {
  color.imgs.forEach(pid => saveImgByPid(pid, color.prod, color.value))
}

const saveImgsByColors = colors => {
  colors.forEach(color => saveImgsByColor(color))
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
