<template>
  <div id="intersect"></div>
</template>

<script>
export default {
  name: 'intersect',
  props: ['len'],
  data() {
    return {}
  },
  methods: {
    checkIntersect() {
      if (this.isIntersecting && this.prodsLen > this.len) this.$emit('enter')
      else clearInterval(this.interval)
    },
  },
  created() {
    this.interval = null
    this.observer = new IntersectionObserver(
      entries => {
        this.isIntersecting = entries[0].isIntersecting
        clearInterval(this.interval)
        this.checkIntersect()
        this.interval = setInterval(this.checkIntersect, 200)
      },
      {
        rootMargin: '0px',
        threshold: 1.0,
      },
    )
  },
  mounted() {
    this.$nextTick(() => {
      // this.$emit('enter')
      this.observer.observe(this.$el)
      // console.log(this.observer)
    })
  },
  destroyed() {
    this.observer.disconnect()
    clearInterval(this.interval)
  },
  watch: {
    prodsLen: function() {
      clearInterval(this.interval)
      this.interval = setInterval(this.checkIntersect, 300)
    },
  },
  computed: {
    prodsLen: {
      get() {
        return this.$store.state.prods.length
      },
    },
  },
}
</script>

<style scoped>
#intersect {
  /* position: absolute;
  bottom: 5vh;
  left: 0; */
  width: 1px;
  height: 1px;
  /* background-color: red; */
}
</style>
