<template>
  <div id="app" :style="fontSize">
    <transition-group name="mess" tag="div" class="col flex-1">
      <div class="flex-1 center height-2 bg red relative p-a-4 m-b-4" v-for="(message, i) in mess" :key="message+i">
        <button class="btn close icon-white size-06 absolute at-top at-right" @click="$store.commit('spliceMess', i)" />{{message}}</div>
    </transition-group>
    <!-- <keep-alive include="home"> -->
    <router-view/>
    <!-- </keep-alive> -->
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {},
  created() {
    console.log('App created')
  },
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
}
</style>
