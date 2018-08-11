import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import * as mutations from './mutations'
import * as getters from './getters'
import * as actions from './actions'
import plugin from './persist.js'
// import plugin from './plugin.js'

Vue.use(Vuex)
const store = new Vuex.Store({
  state,
  mutations,
  getters,
  actions,
  plugins: [plugin],
})

if (module.hot) {
  module.hot.accept(['./state', './mutations', './getters', './actions'], () => {
    store.hotUpdate({
      state: require('./state').default,
      mutations: require('./mutations'),
      getters: require('./getters'),
      actions: require('./actions'),
    })
  })
}

export default store
