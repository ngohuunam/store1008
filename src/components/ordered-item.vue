<template>
  <div class="card">
    <button :class="itemBg" class="btn flex-1 full-width header p-a-4 z-10" @click="expand = !expand">{{header}}
      <button v-if="!item.status.received" class="btn close icon-white size-06 absolute at-top at-right" @click="splice" /></button>
    <div class="flex">
      <button :disabled="!item.status[prop] > 0" class="btn flex-1" v-for="prop in keys" :key="prop" @click="toDate(prop)">{{prop}}</button>
    </div>
    <transition name="max-height">
      <div v-if="expand && !item.status.done" class="body">
        <OrderedItemItem v-for="child in item.items" :key="child.id" :item="child" />
        <div class="payment order" :class="{done: item.status.done}">
          <div>
            <div>Total Amount:</div>
            <div>{{item.payment.totalAmount}}</div>
          </div>
          <div>
            <div>Shipping Cost:</div>
            <div>{{item.payment.shippingCost}}</div>
          </div>
          <div>
            <div>Tax / Fee / Another Cost:</div>
            <div>{{item.payment.taxFee}}</div>
          </div>
          <div>
            <div>Final Payment Amount:</div>
            <div>{{item.payment.totalPayment}}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import OrderedItemItem from '@/components/ordered-item-item.vue'

export default {
  name: 'ordered-item',
  props: ['index'],
  components: { OrderedItemItem },
  data() {
    return {
      expand: false,
      keys: ['received', 'confirmed', 'packed', 'shipped', 'delivered'],
    }
  },
  mounted() {},
  methods: {
    splice() {
      this.$emit('splice')
      this.$store.commit('spliceState', { des: 'ordered', index: this.index })
    },
    toDate(prop) {
      const timestamp = this.item.status[prop]
      const date = new Date(timestamp).toLocaleString('vi')
      const mess = 'Order ' + prop + ' at: ' + date
      this.$store.dispatch('pushMess', { text: mess })
    },
  },
  computed: {
    header: {
      get() {
        const count = this.item.items.length
        const date = new Date(this.item.at).toLocaleString('vi')
        const res = `${date} - ${count} ${count > 1 ? 'items' : 'item'} - Total: ${this.item.payment.totalPayment}`
        return res
      },
    },
    itemBg: {
      get() {
        let color = 'yellow'
        const item = this.item
        if (item.status.confirmed) color = 'cyan'
        if (item.status.shipped) color = 'green'
        if (item.status.done) color = 'light-grey'
        if (item.status.fault) color = 'red'
        return 'bg ' + color
      },
    },
    item: {
      get() {
        return this.$store.state.ordered[this.index]
      },
    },
  },
}
</script>

<style scoped>
</style>
