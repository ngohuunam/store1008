<template>
  <transition-group name="fade" id="home-page" tag="div">
    <!-- Sticky header -->
    <div v-if="show && !sliderData.length" class="card sticky from-to-top" key="page-header">
      <div class="flex justify-end">
        <button class="btn classic border left" @click="shuffle"> Shuffle </button>
        <button class="btn classic border left" @click="routerPush('/cart')">Bag
          <transition name="bounce">
            <div v-if="countBag.cart" class="badge btn-classic">{{countBag.cart}}</div>
          </transition>
        </button>
        <button class="btn classic border left" @click="routerPush('/order')">Order
          <transition name="bounce">
            <div v-if="countBag.order" class="badge btn-classic">{{countBag.order}}</div>
          </transition>
        </button>
        <button class="btn classic border left" @click="routerPush('/ordered')">Ordered
          <transition name="bounce">
            <div v-if="countOrdered" class="badge btn-classic">{{countOrdered}}</div>
          </transition>
        </button>
      </div>
    </div>

    <!-- List items -->
    <HomeItem v-for="n in homeList" :key="n" :name="list[n]" :class="{'from-to-right': n % 2 === 1}" @viewImage="viewImage" @routerPush="routerPush" />

    <!-- Intersect -->
    <Intersect v-if="needLoad" @enter="load" key="intersect" :len="homeList.length" />

    <!-- Modal -->
    <div v-if="sliderData.length" key="modal" class="modal-mask from-to-top" @click="closeModal">
      <div class="modal" @click.stop>
        <button class="btn close absolute at-top at-right z-10" @click="closeModal" />
        <Slider :datas="sliderData" :prod="sliderProd" :nav="true" @navTo="navTo" :activeData="activeData" />
      </div>
    </div>

  </transition-group>
</template>

<script>
import HomeItem from '@/components/home-item.vue'
import Slider from '@/components/img-slider.vue'
import Intersect from '@/components/intersect.vue'

export default {
  name: 'home',
  components: { HomeItem, Slider, Intersect },
  data() {
    return {
      show: false,
      needLoad: false,
      openModal: false,
      sliderData: [],
      activeData: '',
      done: false,
      homeList: [],
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
    viewImage(item, hex) {
      document.documentElement.style.overflow = 'hidden'
      this.sliderProd = item._id
      this.sliderData = item.colors.map(color => {
        return {
          hex: color.value,
          imgs: color.imgs,
        }
      })
      this.activeData = item.colors.findIndex(color => color.value === hex)
    },
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  computed: {
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
