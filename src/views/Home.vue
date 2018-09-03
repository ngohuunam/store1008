<template>
  <transition-group name="fade" id="home-page" tag="div">
    <!-- Sticky header -->
    <div v-if="show" class="card sticky from-to-top" key="page-header">
      <div class="flex justify-end">
        <button class="btn classic bg" :class="`${auth ? 'green' : 'red'}`" @click="login = !login"> {{phone}} </button>
        <button class="flex-1 btn" @click="shuffle"> Shuffle </button>
        <button class="flex-1 btn border-left" @click="routerPush('/cart')">Bag
          <transition name="bounce">
            <div v-if="countBag.cart" class="badge btn-classic">{{countBag.cart}}</div>
          </transition>
        </button>
        <button class="flex-1 btn border-left" @click="routerPush('/order')">Order
          <transition name="bounce">
            <div v-if="countBag.order" class="badge btn-classic">{{countBag.order}}</div>
          </transition>
        </button>
        <button class="flex-1 btn border-left" @click="routerPush('/ordered')">Ordered
          <transition name="bounce">
            <div v-if="countOrdered" class="badge btn-classic">{{countOrdered}}</div>
          </transition>
        </button>
      </div>
    </div>

    <!-- List items -->
    <HomeItem v-for="n in homeList" :key="n" :prodId="list[n]" :class="{'from-to-right': n % 2 === 1}" @routerPush="routerPush" />

    <!-- Intersect -->
    <Intersect v-if="needLoad" @enter="load" key="intersect" :len="homeList.length" />

    <Login v-if="login" key="login" @close="login = !login" />

  </transition-group>
</template>

<script>
import HomeItem from '@/components/home-item.vue'
import Intersect from '@/components/intersect.vue'
import Login from '@/components/modal-login.vue'

export default {
  name: 'home',
  components: { HomeItem, Intersect, Login },
  data() {
    return {
      show: false,
      needLoad: false,
      done: false,
      homeList: [],
      login: false,
    }
  },
  mounted() {
    this.timeout = null
    this.$nextTick(function() {
      this.show = true
      this.needLoad = true
      // this.load()
    })
  },
  methods: {
    closeModal() {
      this.sliderData = []
      document.documentElement.style.overflow = 'auto'
    },
    load() {
      const len = this.homeList.length
      if (len < this.list.length) this.homeList.push(len)
      else this.needLoad = false
    },
    navTo(prod, hex) {
      this.$store.commit('operate', { name: prod, value: { hex: hex } })
    },
    shuffle() {
      this.homeList = this.homeList
        .map(x => [Math.random(), x])
        .sort(([a], [b]) => a - b)
        .map(([, x]) => x)
    },
    routerPush(path) {
      this.homeList = []
      this.show = false
      this.timeout = setTimeout(() => this.$router.push(path), 350)
    },
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  computed: {
    auth: {
      get() {
        return this.$store.state.buyer._id
      },
    },
    phone: {
      get() {
        return this.auth ? this.$store.state.buyer.phone : 'Login'
      },
    },
    countOrdered: {
      get() {
        return this.$store.state.ordered.length
      },
    },
    countBag: {
      get() {
        return this.$store.getters.countBag
      },
    },
    list: {
      get() {
        return this.$store.state.list.value
      },
    },
  },
}
</script>

<style scoped>
#home-page {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;
  min-height: 10vh;
  padding-bottom: 40px;
}
</style>
