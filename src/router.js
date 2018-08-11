import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import(/* webpackChunkName: "cart" */ './views/Cart.vue'),
    },
    {
      path: '/order',
      name: 'order',
      component: () => import(/* webpackChunkName: "order" */ './views/Order.vue'),
    },
    {
      path: '/ordered',
      name: 'ordered',
      component: () => import(/* webpackChunkName: "ordered" */ './views/Ordered.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
})
