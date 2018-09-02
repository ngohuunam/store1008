self.postMessage({ commit: 'setState', payload: { des: 'imgWorker', value: true } })

import { IDStore, getKey, setKey } from 'idb-keyval'
const idbstore = new IDStore('vms-imgs')
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
  self.postMessage({ dispatch: 'pushMess', payload: { text: info } })
  console.error(info)
}

const checkImgsByColors = colors => {
  colors.forEach(color => checkImgsByColor(color))
}

const checkImgsByColor = color => {
  color.imgs.forEach(async pid => {
    try {
      const value = await getKey(pid, idbstore)
      if (value) handleResult({ task: 'checkImg', status: 'ok', prod: color.prod, hex: color.value, key: pid })
      else saveImgByPid(pid, color.prod, color.value)
    } catch (e) {
      handleError({ task: 'checkImg', status: 'get keyvalue error', e: e, prod: color.prod, hex: color.value, key: pid })
    }
  })
}

const saveImgByPid = async (pid, prodId, hex) => {
  const url = remote + pid
  try {
    const blob = await fetchURL(url)
    try {
      await saveBlob(pid, prodId, hex, blob)
      handleResult({ task: 'saveImg', status: 'ok', prod: prodId, hex: hex, key: pid })
    } catch (e) {
      handleError({ task: 'saveBlob', status: 'error', e: e, prod: prodId, hex: hex, pid: pid })
    }
  } catch (e) {
    handleError({ task: 'fetchURL', status: 'error', e: e, prod: prodId, hex: hex, url: url })
  }
}

const saveImgsByColor = color => {
  color.imgs.forEach(async pid => await saveImgByPid(pid, color.prod, color.value))
}

const saveImgsByColors = colors => {
  colors.forEach(async color => await saveImgsByColor(color))
}

const saveBlob = async (pid, prod, hex, blob) => {
  const value = { prod: prod, hex: hex, blob: blob }
  try {
    const res = await setKey(pid, value, idbstore)
    return res
  } catch (e) {
    throw new Error('set keyvalue error: ' + e.message)
  }
}

const fetchURL = async url => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return blob
  } catch (e) {
    throw new Error('fetch error: ' + e.message)
  }
}
