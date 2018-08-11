<template>
  <transition-group name="fade" tag="div" id="ordered-page">
    <!-- Notice when no order item -->
    <div v-if="show && !items.length" class="notice from-to-top" key="notice">
      <h1 class="center">Please buy some product</h1>
      <button class="btn home size-2" @click="routerPush('/')" />
    </div>

    <!-- Page Sticky use to select all or unselect all -->
    <div v-if="items.length && show && !openModal" class="card sticky from-to-top" key="sticky">
      <div class="flex justify-end">
        <button class="flex-1 btn border-left" @click="routerPush('/')">
          <span class="btn home" /> Home </button>
      </div>
    </div>

    <!-- List of ordered items -->
    <OrderedItem v-if="show" v-for="item in orderedItems" :key="item.at" :item="item" />

    <!-- Payment info -->
    <!-- <Modal v-if="openModal" @close="() => openModal = false" key="modal" class="from-to-top" @confirm="confirm" /> -->
  </transition-group>
</template>

<script>
import OrderedItem from '@/components/ordered-item.vue'
import Modal from '@/components/modal-buyer-info.vue'

export default {
  name: 'ordered',
  components: { OrderedItem, Modal },
  data() {
    return {
      show: false,
      orderedItems: [],
      count: 0,
      done: false,
      openModal: false,
    }
  },
  created() {},
  mounted() {
    this.show = true
    if (this.items.length) {
      this.unwatch = this.$watch('orderedItems', function() {
        if (this.orderedItems.length === this.items.length) {
          this.orderedItems = this.items
          setTimeout(() => (this.done = true), 200)
          this.unwatch()
        }
      })
      this.$nextTick(function() {
        setTimeout(this.pushOrderedItems, 200)
      })
    }
  },
  beforeDestroy() {},
  methods: {
    routerPush(path) {
      this.done = false
      this.show = false
      setTimeout(() => this.$router.push(path), 350)
    },
    pushOrderedItems() {
      this.orderedItems.push(this.items[this.count])
      this.count++
      if (this.orderedItems.length < this.items.length) setTimeout(this.pushOrderedItems, 150)
    },
  },
  watch: {
    items: function() {
      this.orderedItems = this.items
    },
  },
  computed: {
    countOrdered: {
      get() {
        return this.$store.getters.countBag.ordered
      },
    },
    countCart: {
      get() {
        return this.$store.getters.countBag.cart
      },
    },
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
