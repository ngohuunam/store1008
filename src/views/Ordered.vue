<template>
  <transition-group name="fade" tag="div" id="ordered-page">
    <!-- Notice when no item -->
    <div v-if="show && !items.length" class="notice from-to-top" key="notice">
      <h1 class="center">Please buy some product</h1>
      <button class="btn home size-2" @click="routerPush('/')" />
    </div>

    <!-- Page Sticky contain general function -->
    <div v-if="items.length && show" class="card sticky from-to-top" key="sticky">
      <div class="flex justify-end">
        <button class="flex-1 btn border-left" @click="routerPush('/')">
          <span class="btn home" /> Home </button>
      </div>
    </div>

    <!-- List of ordered items -->
    <OrderedItem v-for="n in itemList" :key="items[n].at" :item="items[n]" />
  </transition-group>
</template>

<script>
import OrderedItem from '@/components/ordered-item.vue'

export default {
  name: 'ordered',
  components: { OrderedItem },
  data() {
    return {
      show: false,
      itemList: [],
    }
  },
  created() {},
  mounted() {
    this.show = true
    this.timeout = null
    if (this.items.length) {
      this.pushList()
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  methods: {
    pushList() {
      const len = this.itemList.length
      clearTimeout(this.timeout)
      if (len < this.items.length) {
        this.itemList.push(len)
        this.timeout = setTimeout(this.pushList, 200)
      } else this.timeout = setTimeout(() => (this.done = true), 150)
    },
    routerPush(path) {
      this.itemList = []
      this.done = false
      this.show = false
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => this.$router.push(path), 350)
    },
  },
  computed: {
    items: {
      get() {
        return this.$store.state.ordered
      },
    },
  },
}
</script>

<style>
#ordered-page {
  position: relative;
}
</style>
