<template>
  <div id="app" :style="fontSize">
    <transition-group name="mess" tag="div" class="col flex-1 absolute full-width z-top">
      <div class="flex-1 center height-2 bg p-a-4 m-b-4 relative" v-for="(message, i) in mess" :key="message.text+i" :class="message.color || 'red'">
        <button class="btn close icon-white size-06 absolute at-top at-right" @click="$store.commit('spliceState', {des: 'mess', index: i})" />{{message.text}}</div>
    </transition-group>
    <transition name="fade">
      <Modal v-if="$store.state.sliderData" />
    </transition>
    <div class="loader" v-if="loader">Loading...</div>
    <keep-alive include="home-item">
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
import Modal from '@/components/modal-slider.vue'
export default {
  name: 'App',
  components: { Modal },
  created() {},
  mounted() {
    const size = this.$el.clientWidth * 0.04
    this.fontSize = `font-size: ${size}px !important;`
  },
  data() {
    return {
      fontSize: 16,
    }
  },
  watch: {},
  methods: {},
  computed: {
    loader: {
      get() {
        return this.$store.state.loader
      },
    },
    mess: {
      get() {
        return this.$store.state.mess
      },
    },
  },
  beforeDestroy() {},
}
</script>

<style>
#app {
  width: 100%;
  max-width: 1200px;
  min-height: calc(100vh - 16px - 2.5em);
  margin: 0 auto;
  overflow-x: hidden;
  padding-top: 2.5em;
  position: relative;
}
</style>
