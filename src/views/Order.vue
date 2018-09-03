<template>
  <transition-group name="fade" tag="div" id="order-page" :class="{'ani-reverse': del}">

    <!-- Page Function sticky -->
    <div v-if="show" class="card sticky from-to-top" key="sticky">
      <div class="flex justify-end">
        <button :disabled="!items.length" class="flex-1 btn" @click="backAllToCart">
          <span class="btn arrow-left" /> All </button>
        <button class="flex-1 btn border-left" @click="routerPush('/')"> Home </button>
        <button class="flex-1 btn border-left" @click="routerPush('/cart')"> Cart
          <transition name="bounce">
            <div v-if="countCart" class="badge btn-classic">{{countCart}}</div>
          </transition>
        </button>
        <button class="flex-1 btn border-left" @click="routerPush('/ordered')"> Ordered
          <transition name="bounce">
            <div v-if="countOrdered" class="badge btn-classic">{{countOrdered}}</div>
          </transition>
        </button>
        <button :disabled="!items.length" class="flex-1 btn border-left" @click="spliceAllOrder">
          <span class="btn close" /> All </button>
      </div>
    </div>

    <!-- Notice when no cart item -->
    <div v-if="show && !items.length" class="notice from-to-top" key="notice">
      <h1 class="center">Please get some product</h1>
    </div>

    <!-- List of order items -->
    <OrderItem v-for="(n, i) in itemList" class="ani-move active-absolute" :key="items[i].key" :item="items[i]" :index="i" @splice="splice" />

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
      <button class="btn full-width bg green m-t-4" @click="openModal = true"> {{logged ? 'Place Order' : 'Login First'}} </button>
    </div>
    <!-- <Modal v-if="openModal" @close="() => openModal = false" key="modal" class="from-to-top" @confirm="confirm" /> -->
    <component :is="modal" v-if="openModal" @close="openModal = false" key="modal" class="from-to-top" @confirm="confirm"></component>
  </transition-group>
</template>

<script>
import OrderItem from '@/components/order-item.vue'
import Contact from '@/components/modal-buyer-info.vue'
import Login from '@/components/modal-login.vue'

export default {
  name: 'order',
  components: { OrderItem, Contact, Login },
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
        this.timeout = setTimeout(this.pushList, 100)
      } else
        this.timeout = setTimeout(() => {
          this.done = true
          clearTimeout(this.timeout)
        }, 100)
    },
    confirm() {
      const time = Date.now()
      const items = this.items.map(item => {
        const price = this.$store.getters.itemPrice(item) * 1000
        const total = item.order * price
        const priceString = price.toLocaleString('vi') + 'đ'
        const amount = `${item.order} x ${priceString} = ${total.toLocaleString('vi')}đ`
        const img = this.$store.getters.orderImg(item)
        const info = `Color: ${item.label}, Size: ${item.size}`
        return {
          _id: item._id,
          _rev: item._rev,
          prodId: item.prodId,
          hex: item.hex,
          size: item.size,
          price: priceString,
          quantity: item.order,
          amount: amount,
          info: info,
          img: img,
        }
      })
      const orderedItem = {
        _id: this.$store.state.buyer._id + '@' + time,
        _rev: '',
        at: time,
        items: items,
        status: {
          received: 0,
          confirmed: 0,
          packed: 0,
          shipped: 0,
          trackingNo: 0,
          delivered: 0,
          done: 0,
          fault: 0,
        },
        payment: {
          shippingCost: this.shippingCost,
          taxFee: this.taxFee,
          totalAmount: this.totalOrderAmount.label,
          totalPayment: this.finalOrderPayment,
          paid: 0,
          payType: 0,
        },
        buyer: this.$store.state.buyer,
      }
      this.itemList = []
      this.$store.commit('newOrder', orderedItem)
      this.$router.push('/ordered')
      this.openModal = false
    },
    spliceAllOrder() {
      this.del = true
      this.itemList = []
      this.items.map(item => {
        const info = {
          des: 'order',
          _id: item._id,
          quantity: -item.order,
        }
        this.$store.commit('change', info)
      })
    },
    backAllToCart() {
      this.del = false
      this.itemList = []
      this.items.map(item => this.$store.commit('backToCart', item._id))
    },
    routerPush(path) {
      this.itemList = []
      this.done = false
      this.show = false
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => this.$router.push(path), 350)
    },
    splice(index, bool) {
      this.del = bool
      this.itemList.splice(index, 1)
    },
  },
  computed: {
    countOrdered: {
      get() {
        return this.$store.state.ordered.length
      },
    },
    modal: {
      get() {
        return this.logged ? 'Contact' : 'Login'
      },
    },
    logged: {
      get() {
        return this.$store.state.buyer._id
      },
    },
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
