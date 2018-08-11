<template>
  <div class="slider-container" :style="height">
    <transition :name="transitionName" class="slider">
      <ImageLoad :src="img" :key="img" v-touch:swipe.left="next" v-touch:swipe.right="previous" />
    </transition>

    <div class="nav-slider" v-if="nav">
      <div>
        <div v-for="(_img, i) in imgs" :key="i" @click="img_i = i" class="dot center">
          <div class="small" :class="{active: img_i === i}" :style="{'background-color': data.hex}" />
        </div>
      </div>
      <div v-if="datas.length > 1">
        <div v-for="(d, i) in datas" :key="d.hex" @click="navTo(i)" class="dot center">
          <div class="large" :class="{active: data_i === i}" :style="{'background-color': d.hex}" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ImageLoad from '@/components/image-load.vue'

export default {
  name: 'img-slider',
  props: ['datas', 'nav', 'auto', 'ratio', 'activeData'],
  components: { ImageLoad },
  data() {
    return {
      img_i: 0,
      data_i: 0,
      transitionName: '',
      h: 0,
      fs: 0,
    }
  },
  mounted() {
    this.$nextTick(function() {
      const ratio = this.ratio || 4 / 3
      this.h = this.$el.clientWidth * ratio
      this.fs = this.h * 0.02
      if (this.auto) {
        const random = (Math.floor(Math.random() * (5 - 1 + 1)) + 1) * 100
        const time = this.auto * 1000 + random
        this.interval = setInterval(this.next, time)
      }
      this.data_i = this.activeData || 0
    })
  },
  methods: {
    navTo(i) {
      this.data_i = i
      this.img_i = 0
      this.$emit('navTo', i)
    },
    next() {
      this.transitionName = 'left-right'
      if (this.img_i === this.imgs.length - 1) {
        if (this.datas.length > 1) {
          if (this.data_i === this.datas.length - 1) this.data_i = 0
          else this.data_i += 1
          this.$emit('navTo', this.data_i)
        }
        this.img_i = 0
      } else this.img_i += 1
    },
    previous() {
      this.transitionName = 'right-left'
      if (this.img_i === 0) {
        if (this.datas.length > 1) {
          if (this.data_i === 0) this.data_i = this.datas.length - 1
          else this.data_i -= 1
          this.$emit('navTo', this.data_i)
        }
        this.img_i = this.imgs.length - 1
      } else this.img_i -= 1
    },
  },
  computed: {
    height() {
      return this.h ? `height: ${this.h}px; font-size: ${this.fs}px` : ''
    },
    hex() {
      return this.data.hex
    },
    img() {
      return this.imgs[this.img_i]
    },
    imgs() {
      return this.data.imgs
    },
    data() {
      return this.datas[this.data_i]
    },
  },
  beforeDestroy() {
    if (this.interval) clearInterval(this.interval)
  },
}
</script>

<style scoped>
.slider-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.nav-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 1%;
  left: 50%;
  transform: translateX(-50%);
}
.nav-slider > div {
  display: flex;
}
.dot {
  width: 3em;
  height: 3em;
  padding: 1em 1.7em;
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
.slider img {
  position: absolute;
  height: 100%;
}
@media (min-aspect-ratio: 1024/1366) {
  .nav {
    bottom: 9%;
    opacity: 0.6;
  }
}
</style>
