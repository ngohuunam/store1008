<template>
  <div>
    <img class="fit" v-if="!loaded && show" :src="loading" />
    <img class="fit" v-show="loaded" :src="src" @load="loaded = true" @error="loaded = false" />
  </div>
</template>

<script>
export default {
  name: 'image-load',
  props: ['src'],
  components: {},
  created() {},
  mounted() {
    this.$nextTick(function() {
      this.show = true
    })
  },
  data() {
    return {
      loaded: false,
      show: false,
    }
  },
  methods: {},
  computed: {
    loading: {
      get() {
        return this.$store.state.loading
      },
    },
  },
  beforeDestroy() {},
}
</script>

<style scoped>
</style>
