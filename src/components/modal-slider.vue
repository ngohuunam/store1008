<template>
  <div class="modal-mask" v-if="prodId">
    <div class="modal">
      <button class="btn close absolute at-top at-right z-10" @click="close" />
      <div class="slider-container">
        <transition :name="transitionName" class="slider">
          <ImageLoad :prodId="prodId" :hex="color.value" :pid="img" :key="img" v-touch:swipe.left="next" v-touch:swipe.right="previous" />
        </transition>

        <div class="slider-nav">
          <div>
            <div v-for="(_img, i) in imgs" :key="i" @click="img_i = i" class="dot center">
              <div class="small" :class="{active: img_i === i}" :style="{'background-color': color.value}" />
            </div>
          </div>
          <div v-if="colors.length > 1">
            <div v-for="(c, i) in colors" :key="c.value" @click="navTo(i)" class="dot center">
              <div class="large" :class="{active: color_i === i}" :style="{'background-color': c.value}" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex">
        <button class="btn flex-1 bg green" @click="pick"> {{atCart ? 'Change Color' : 'Pick'}} </button>
        <button class="btn flex-1" @click="$store.commit('setState', {des: 'sliderData', value: null})"> Cancel </button>
      </div>
    </div>
  </div>
</template>

<script>
import ImageLoad from '@/components/image-load.vue'

export default {
  name: 'modal-slider',
  props: [],
  components: { ImageLoad },
  data() {
    return {
      img_i: 0,
      color_i: 0,
      transitionName: 'left-right',
    }
  },
  created() {
    this.color_i = this.colors.findIndex(color => color.value === this.$store.state.sliderData.hex)
    this.img_i = this.$store.state.sliderData.img_i
  },
  methods: {
    close() {
      this.$store.commit('setState', { des: 'sliderData', value: null })
      document.documentElement.style.overflow = 'auto'
    },
    pick() {
      if (this.atCart) {
        const info = this.$store.state.sliderData.info
        if (info.hex !== this.color.value) {
          info.hex = this.color.value
          info.label = this.color.label
          const newId = `${info.prodId}.${this.color.label}-${info.hex.slice(0)}_${info.size}`
          info.newId = newId
          info.img_i = this.img_i
          this.$store.commit('cartChangeProperty', info)
        } else if (info.img_i !== this.img_i) this.$store.commit('cartChangeImg', { id: info.currentId, i: this.img_i })
      }
      this.$store.commit('operate', { prodId: this.prodId, value: { hex: this.color.value, img_i: this.img_i } })
      this.$store.commit('setState', { des: 'sliderData', value: null })
    },
    navTo(i) {
      this.transitionName = i > this.color_i ? 'left-right' : 'right-left'
      this.color_i = i
      this.img_i = 0
    },
    next() {
      this.transitionName = 'left-right'
      if (this.img_i === this.imgs.length - 1) {
        if (this.colors.length > 1) {
          if (this.color_i === this.colors.length - 1) this.color_i = 0
          else this.color_i += 1
        }
        this.img_i = 0
      } else this.img_i += 1
    },
    previous() {
      this.transitionName = 'right-left'
      if (this.img_i === 0) {
        if (this.colors.length > 1) {
          if (this.color_i === 0) this.color_i = this.colors.length - 1
          else this.color_i -= 1
        }
        this.img_i = this.imgs.length - 1
      } else this.img_i -= 1
    },
  },
  computed: {
    atCart: {
      get() {
        return this.$route.name === 'cart'
      },
    },
    img: {
      get() {
        return this.imgs[this.img_i]
      },
    },
    imgs: {
      get() {
        return this.color.imgs
      },
    },
    color: {
      get() {
        return this.colors[this.color_i]
      },
    },
    colors: {
      get() {
        return this.$store.getters.colors(this.prodId)
      },
    },
    prodId: {
      get() {
        return this.$store.state.sliderData.prodId
      },
    },
  },
  watch: {},
}
</script>

<style scoped>
.slider-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  display: flex;
}
.slider-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 1%;
  left: 50%;
  transform: translateX(-50%);
}
.slider-nav > div {
  display: flex;
}
.dot {
  width: 2.5em;
  height: 2.5em;
  padding: 1em;
}
.dot > div {
  border-radius: 50%;
  box-shadow: 0.1em 0.1em 0.2em rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
  width: 100%;
  height: 100%;
}
.dot > .small {
  width: 30%;
  height: 30%;
}
.small.active,
.large.active {
  transform: scale(1.4);
  opacity: 1;
  transition: all 0.3s;
  box-shadow: 0 0 3em 0.2em rgba(0, 255, 86, 0.6);
}
.slider {
  position: relative;
  height: 100%;
  overflow: hidden;
}
.slider img,
.slider div {
  position: absolute;
  height: 100%;
}
</style>
