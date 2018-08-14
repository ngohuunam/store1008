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
        <button class="btn classic border left" @click="routerPush('/ordered')">Ordered</button>
      </div>
    </div>

    <!-- List items -->
    <HomeItem v-if="show && prodLen > 4" v-for="(n, i) in homeList" :index="i" :key="n" :name="list[n]" :class="{'from-to-right': i % 2 === 1}" @viewImage="viewImage" @routerPush="routerPush" />

    <!-- Intersect -->
    <Intersect v-if="show && prodLen > 4" @enter="load" key="intersect" />

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
      openModal: false,
      sliderData: [],
      activeData: '',
      done: false,
      itemIndex: null,
      homeList: [],
      sliderProd: '',
    }
  },
  mounted() {
    this.$nextTick(function() {
      this.show = true
      // this.load()
    })
  },
  // watch: {
  //   list: function() {
  //     this.load()
  //   },
  // },
  methods: {
    closeModal() {
      this.sliderData = []
      document.documentElement.style.overflow = 'auto'
    },
    load() {
      const len = this.homeList.length
      if (this.list.length && this.list.length > len) {
        const arrayLen = this.list.length - len > 4 ? 4 : this.list.length - len
        const map = new Array(arrayLen).fill('o')
        map.map((ele, i) => {
          setTimeout(() => {
            const no = this.homeList.length
            // console.log('len', len)
            // console.log('no', no)
            if (len < this.list.length) this.homeList.push(no)
            // console.log('this.homeList', this.homeList)
          }, 400 * i)
        })
      }
    },
    navTo(prod, hex) {
      this.$store.commit('operate', { name: prod, value: { hex: hex } })
    },
    shuffle() {
      this.homeItems = this.homeItems
        .map(x => [Math.random(), x])
        .sort(([a], [b]) => a - b)
        .map(([, x]) => x)
    },
    routerPush(path) {
      this.show = false
      setTimeout(() => this.$router.push(path), 350)
    },
    viewImage(item, hex, itemIndex) {
      document.documentElement.style.overflow = 'hidden'
      this.itemIndex = itemIndex
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
  beforeDestroy() {},
  computed: {
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
    prodLen: {
      get() {
        return this.$store.state.prods.length
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
  /* min-height: 100vh; */
}
</style>
