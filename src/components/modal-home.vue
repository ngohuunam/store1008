<template>
  <div class="modal-mask" @click="$emit('close')">
    <div class="modal" @click.stop>
      <button class="btn close absolute at-top at-right z-10" @click="$emit('close')" />
      <Slider :datas="sliderData" :nav="true" @navTo="navTo" :activeData="activeData" />
    </div>
  </div>
</template>

<script>
import Slider from '@/components/img-slider.vue'

export default {
  name: 'modal',
  components: { Slider },
  props: ['colors', 'activeData'],
  data() {
    return {}
  },
  created() {},
  methods: {
    navTo() {
      console.log(this)
    },
  },
  computed: {
    sliderData: {
      get() {
        return this.colors.map(color => {
          return {
            hex: color.hex,
            imgs: color.imgs,
          }
        })
      },
    },
  },
  watch: {},
}
</script>

<style scoped>
</style>
