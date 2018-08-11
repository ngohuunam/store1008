import Vue from 'vue'
// import WW from 'worker-loader!./ww.js'

// const worker = new WW()
// worker.onmessage = function(e) {
//   // console.log('Message received from worker', e)
//   bus.$emit('ww', e.data)
// }

const bus = new Vue({
  methods: {
    // command(params) {
    // worker.postMessage(JSON.stringify({ func: params.func, params: params }))
    // worker.postMessage(params)
    // },
  },
})

export default bus
