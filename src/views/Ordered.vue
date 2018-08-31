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
        <button class="flex-1 btn" @click="routerPush('/')"> Home </button>
        <button class="flex-1 btn border-left" :class="{'bg green': filterState==='all'}" @click="filterState='all'">All
          <transition name="bounce">
            <div v-if="filterCount('all')" class="badge btn-classic">{{filterCount('all')}}</div>
          </transition>
        </button>
        <button class="flex-1 btn border-left" :class="{'bg green': filterState==='pending'}" @click="filterState='pending'">Pending
          <transition name="bounce">
            <div v-if="filterCount('pending')" class="badge btn-classic">{{filterCount('pending')}}</div>
          </transition>
        </button>
        <button class="flex-1 btn border-left" :class="{'bg green': filterState==='done'}" @click="filterState='done'">Done
          <transition name="bounce">
            <div v-if="filterCount('done')" class="badge btn-classic">{{filterCount('done')}}</div>
          </transition>
        </button>
        <button class="flex-1 btn border-left" :class="{'bg green': filterState==='canceled'}" @click="filterState='canceled'">Canceled
          <transition name="bounce">
            <div v-if="filterCount('canceled')" class="badge btn-classic">{{filterCount('canceled')}}</div>
          </transition>
        </button>
      </div>
    </div>

    <!-- List of ordered items -->
    <OrderedItem v-if="filter(n)" v-for="n in itemList" :key="items[n].at" class="ani-move active-absolute" :index="n" @splice="splice" />
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
      filterState: 'pending',
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
    splice() {
      this.itemList.pop()
    },
    filter(index) {
      const item = this.items[index]
      switch (this.filterState) {
        case 'pending':
          return item.status.done === 0
        case 'done':
          return item.status.done > 0 && item.status.delivered > 0 && item.status.fault === 0
        case 'canceled':
          return item.status.done > 0 && item.status.delivered === 0 && item.status.fault > 0
        default:
          return true
      }
    },
    filterCount(state) {
      switch (state) {
        case 'pending':
          return this.items.filter(item => item.status.done === 0).length
        case 'done':
          return this.items.filter(item => item.status.done > 0 && item.status.delivered > 0 && item.status.fault === 0).length
        case 'canceled':
          return this.items.filter(item => item.status.done > 0 && item.status.delivered === 0 && item.status.fault > 0).length
        default:
          return this.items.length
      }
    },
    pushList() {
      const len = this.itemList.length
      clearTimeout(this.timeout)
      if (len < this.items.length) {
        this.itemList.push(len)
        this.timeout = setTimeout(this.pushList, 100)
      } else this.timeout = setTimeout(() => (this.done = true), 100)
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
