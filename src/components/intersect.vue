<template>
  <div id="intersect"></div>
</template>

<script>
export default {
  name: 'intersect',
  props: {},
  created() {
    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          this.$emit('enter')
        }
      },
      {
        rootMargin: '0px',
        threshold: 1.0,
      },
    )
  },
  mounted() {
    this.$nextTick(() => {
      this.$emit('enter')
      this.observer.observe(this.$el)
    })
  },
  destroyed() {
    this.observer.disconnect()
  },
}
</script>

<style scoped>
#intersect {
  position: absolute;
  bottom: 70vh;
  left: 0;
  width: 1px;
  height: 1px;
  /* background-color: red; */
}
</style>
