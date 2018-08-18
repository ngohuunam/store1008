<template>
  <transition-group name="fade" tag="div" id="order-page" :class="{'ani-reverse': del}">
    <!-- Notice when no order item -->
    <div v-if="show && !items.length" class="notice from-to-top" key="notice">
      <h1 class="center">Please get some product</h1>
      <button class="btn home size-2" @click="routerPush('/')" />
      <button class="btn bag size-2" :class="{fill: countCart}" @click="routerPush('/cart')">
        <transition name="bounce">
          <div v-if="countCart" class="badge">{{countCart}}</div>
        </transition>
      </button>
      <button class="btn home size-2" @click="routerPush('/ordered')" />
    </div>

    <!-- Page Sticky use to select all or unselect all -->
    <div v-if="items.length && show && !openModal" class="card sticky from-to-top" key="sticky">
      <div class="flex justify-end">
        <button class="flex-1 btn" @click="backAllToCart">
          <span class="btn arrow-left" /> All cart </button>
        <button class="flex-1 btn border-left" @click="routerPush('/cart')">
          <span class="btn bag" :class="{fill: countCart}">
            <transition name="bounce">
              <div v-if="countCart" class="badge">{{countCart}}</div>
            </transition>
          </span> Cart
        </button>
        <button class="flex-1 btn border-left" @click="routerPush('/')">
          <span class="btn home" /> Home </button>
        <button class="flex-1 btn border-left" @click="spliceAllOrder">
          <span class="btn close" /> Del all </button>
      </div>
    </div>

    <!-- List of order items -->
    <OrderItem v-for="n in itemList" class="ani-move active-absolute" :key="items[n].key" :item="items[n]" @isDel="isDel" />

    <!-- Payment info -->
    <div v-if="done && items.length" class="payment order from-to-bot ani-move" key="payment">
      <div>
        <div>Total Amount:</div>
        <div>{{totalOrderAmount.label}}</div>
      </div>
      <div>
        <div>Shipping Cost:</div>
        <div>{{shippingCost}}</div>
      </div>
      <div>
        <div>Tax / Fee / Another Cost:</div>
        <div>{{taxFee}}</div>
      </div>
      <div>
        <div>Final Payment Amount:</div>
        <div>{{finalOrderPayment}}</div>
      </div>
      <button class="btn full-width bg green m-t-4" @click="placeOrder"> Place Order </button>
    </div>
    <Modal v-if="openModal" @close="() => openModal = false" key="modal" class="from-to-top" @confirm="confirm" />
  </transition-group>
</template>

<script>
import OrderItem from '@/components/order-item.vue'
import Modal from '@/components/modal-buyer-info.vue'

export default {
  name: 'order',
  components: { OrderItem, Modal },
  data() {
    return {
      show: false,
      done: false,
      del: false,
      openModal: false,
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
    confirm() {
      const buyerInfo = this.$store.state.buyerInfo
      const time = Date.now()
      const items = this.items.map(item => {
        const price = this.$store.getters.itemPrice(item) * 1000
        const total = item.order * price
        const amount = `${item.order} x ${price.toLocaleString('vi')}đ = ${total.toLocaleString('vi')}đ`
        const img = this.$store.getters.orderImg(item)
        const info = `Color: ${item.label}, Size: ${item.size}`
        return {
          id: item.id,
          name: item.name,
          hex: item.hex,
          size: item.size,
          amount: amount,
          info: info,
          img: img,
        }
      })
      const orderedItem = {
        ...{
          _id: this.$store.state.buyerId + '@' + time,
          _rev: '',
          buyerId: this.$store.state.buyerId,
          at: time,
          received: null,
          confirmed: null,
          packed: null,
          shiped: null,
          trackingNo: null,
          delivered: null,
          payed: null,
          payType: null,
          done: false,
          fault: false,
          items: items,
          shippingCost: this.shippingCost,
          taxFee: this.taxFee,
          totalAmount: this.totalOrderAmount.label,
          totalPayment: this.finalOrderPayment,
        },
        ...buyerInfo,
      }
      this.itemList = []
      this.$store.commit('pushOrdered', orderedItem)
      this.openModal = false
    },
    placeOrder() {
      this.openModal = true
    },
    spliceAllOrder() {
      this.del = true
      this.items.map(item => {
        const info = {
          des: 'order',
          id: item.id,
          quantity: -item.order,
        }
        this.$store.commit('change', info)
      })
    },
    backAllToCart() {
      this.del = false
      this.items.map(item => this.$store.commit('backToCart', item.id))
    },
    routerPush(path) {
      this.itemList = []
      this.done = false
      this.show = false
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => this.$router.push(path), 350)
    },
    isDel(bool) {
      this.del = bool
    },
  },
  computed: {
    countCart: {
      get() {
        return this.$store.getters.countBag.cart
      },
    },
    shippingCost: {
      get() {
        return this.$store.getters.shippingCost
      },
    },
    taxFee: {
      get() {
        return this.$store.getters.taxFee
      },
    },
    finalOrderPayment: {
      get() {
        return (this.totalOrderAmount.value ? ((this.totalOrderAmount.value + this.$store.state.shippingCost + this.$store.state.taxFee) * 1000).toLocaleString('vi') : 0) + 'đ'
      },
    },
    totalOrderAmount: {
      get() {
        const sum = this.items.reduce((sum, item) => {
          const price = this.$store.getters.itemPrice(item)
          return sum + item.order * price
        }, 0)
        const label = (sum * 1000).toLocaleString('vi') + 'đ'
        return { value: sum, label: label }
      },
    },
    items: {
      get() {
        return this.$store.getters.allItems('order')
      },
    },
  },
}
</script>

<style>
#order-page {
  position: relative;
}
</style>
