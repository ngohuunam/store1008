import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './vuex/store'
import './registerServiceWorker'
import Vue2TouchEvents from 'vue2-touch-events'
import './assets/style.css'
// import LocalForage from 'localforage'
// import Dexie from 'dexie'

Vue.config.productionTip = false
Vue.config.devtools = true
Vue.config.performance = true

Vue.use(Vue2TouchEvents, {
  swipeTolerance: 50,
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
