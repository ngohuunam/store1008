<template>
  <div class="card">
    <button :disabled="done" :class="itemBg" class="btn flex-1 full-width header p-a-4 z-10" @click="expand = !expand">{{header}}</button>
    <div class="flex">
      <button :disabled="!item[_key] || done" class="btn flex-1" v-for="_key in keys" :key="_key">{{_key}}</button>
    </div>
    <transition name="max-height">
      <div v-if="expand && !done" class="body">
        <OrderedItemItem v-for="child in item.items" :key="child.id" :item="child" />
        <div class="payment order">
          <div>
            <div>Total Amount:</div>
            <div>{{item.totalAmount}}</div>
          </div>
          <div>
            <div>Shipping Cost:</div>
            <div>{{item.shippingCost}}</div>
          </div>
          <div>
            <div>Tax / Fee / Another Cost:</div>
            <div>{{item.taxFee}}</div>
          </div>
          <div>
            <div>Final Payment Amount:</div>
            <div>{{item.totalPayment}}</div>
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
  props: ['item'],
  components: { OrderedItemItem },
  data() {
    return {
      expand: false,
      keys: ['confirmed', 'packed', 'taked', 'received'],
      done: false,
    }
  },
  mounted() {},
  methods: {},
  computed: {
    header: {
      get() {
        const count = this.item.items.length
        const date = new Date(this.item.at).toLocaleString('vi')
        const res = `${date} - ${count} items - Total: ${this.item.totalPayment}`
        return res
      },
    },
    itemBg: {
      get() {
        let color = 'yellow'
        const item = this.item
        if (item.confirmed) color = 'cyan'
        if (item.taked) color = 'green'
        if (item.done) color = 'light-grey'
        if (item.fault) color = 'red'
        return 'bg ' + color
      },
    },
  },
}
</script>

<style scoped>
</style>
