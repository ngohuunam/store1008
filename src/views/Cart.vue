<template>
  <transition-group name="fade" tag="div" id="cart-page" :class="{expand: expand, 'ani-reverse': toOrder}">

    <!-- Notice when no cart item -->
    <div v-if="show && !items.length" class="notice from-to-top" key="notice">
      <h1 class="center">Please get some product</h1>
      <button class="btn home size-2" @click="routerPush('/')" />
      <button class="btn order size-2" :class="{fill: countOrder}" @click="routerPush('/order')">
        <transition name="bounce">
          <div v-if="countOrder" class="badge">{{countOrder}}</div>
        </transition>
      </button>
    </div>

    <!-- Page header Sticky  -->
    <div v-if="items.length && show" class="card sticky from-to-top" key="page-header">
      <div class="flex align-center space-between">
        <div class="flex align-center">
          <button class="btn check" :class="{checked : allCartChecked}" @click="toggleCheckAll" />
          <div>Select all </div>
          <button :disabled="!hasCartChecked" class="btn un-check m-l-4" @click="$store.commit('toggleCheckAll', false)" />
          <div :class="{'text-grey' : !hasCartChecked}">Unselect all</div>
        </div>
        <div class="flex">
          <button class="flex btn classic" @click="routerPush('/order')">
            <span class="btn order" :class="{fill: countOrder}">
              <transition name="bounce">
                <div v-if="countOrder" class="badge">{{countOrder}}</div>
              </transition>
            </span> Order
          </button>
          <button class="btn home m-l-4" @click="routerPush('/')" />
          <button :disabled="!hasCartChecked" class="btn close bg-left m-l-4" @click="$store.commit('spliceChecked')" />
        </div>
      </div>
    </div>

    <!-- List of cart items -->
    <CartItem v-if="show" v-for="item in cartItems" :key="item.key" :item="item" class="ani-move active-absolute" @routerPush="routerPush" @spliceCart="() => toOrder = false" />

    <!-- Bottom sticky payment info -->
    <div v-if="done && expand" class="payment cart from-to-bot ani-move" key="payment-expand">
      <button class="btn arrow-down full-width absolute at-top-over-2em" @click="toggle(false)" />
      <div>
        <div>Total Cart Amount:</div>
        <div>{{payment.cart.total}}</div>
      </div>
      <div>
        <div>Total Order Amount:</div>
        <div>{{payment.order.total}}</div>
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
        <div>Final Cart Payment Amount:</div>
        <div>{{payment.cart.final}}</div>
      </div>
      <div>
        <div>Final Order Payment Amount:</div>
        <div>{{payment.order.final}}</div>
      </div>
      <button :disabled="!payment.order.sum" class="btn full-width bg green" @click="createOrder"> Create Order </button>
    </div>
    <div v-if="done && !expand" class="payment cart from-to-bot ani-move" key="payment">
      <button class="btn arrow-up full-width absolute at-top-over-2em" @click="toggle(true)" />
      <div>
        <div>Final Cart Payment Amount:</div>
        <div>{{payment.cart.final}}</div>
      </div>
      <div>
        <div>Final Order Payment Amount:</div>
        <div>{{payment.order.final}}</div>
      </div>
      <button :disabled="!payment.order.sum" class="btn full-width bg green" @click="createOrder"> Create Order </button>
    </div>
  </transition-group>
</template>

<script>
import CartItem from '@/components/cart-item.vue'

export default {
  name: 'cart',
  components: { CartItem },
  data() {
    return {
      expand: false,
      show: false,
      cartItems: [],
      count: 0,
      toOrder: false,
      done: false,
    }
  },
  created() {},
  mounted() {
    this.show = true
    if (this.items.length) {
      this.unwatch = this.$watch('cartItems', function() {
        if (this.cartItems.length === this.items.length) {
          this.cartItems = this.items
          setTimeout(() => (this.done = true), 300)
          this.unwatch()
        }
      })
      this.$nextTick(function() {
        setTimeout(this.pushCartItems, 200)
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
    pushCartItems() {
      this.cartItems.push(this.items[this.count])
      this.count++
      if (this.cartItems.length < this.items.length) setTimeout(this.pushCartItems, 150)
    },
    toggleCheckAll() {
      if (this.allCartChecked) this.$store.commit('toggleCheckAll', false)
      else this.$store.commit('toggleCheckAll', true)
    },
    toggle(boolean) {
      this.expand = boolean
    },
    createOrder() {
      this.toOrder = true
      this.$store.commit('toOrder')
      if (!this.items.length) this.routerPush('/order')
    },
  },
  watch: {
    items: function() {
      this.cartItems = this.items
    },
  },
  computed: {
    countOrder: {
      get() {
        return this.$store.getters.countBag.order
      },
    },
    allCartChecked: {
      get() {
        return this.$store.getters.allCartChecked
      },
    },
    hasCartChecked: {
      get() {
        return this.$store.getters.hasCartChecked
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
    payment: {
      get() {
        const ship = this.$store.state.shippingCost
        const fee = this.$store.state.taxFee
        const first = { cart: { sum: 0, total: '', final: '' }, order: { sum: 0, total: '', final: '' } }
        const response = this.items.reduce((res, item) => {
          const price = this.$store.getters.itemPrice(item)
          res.cart.sum += item.cart * price
          res.order.sum += item.check ? item.cart * price : 0
          return res
        }, first)
        response.cart.total = (response.cart.sum * 1000).toLocaleString('vi') + 'đ'
        response.cart.final = ((response.cart.sum + ship + fee) * 1000).toLocaleString('vi') + 'đ'
        response.order.total = (response.order.sum * 1000).toLocaleString('vi') + 'đ'
        response.order.final = (response.order.sum ? ((response.order.sum + ship + fee) * 1000).toLocaleString('vi') : 0) + 'đ'
        return response
      },
    },
    items: {
      get() {
        return this.$store.getters.allItems('cart')
      },
    },
  },
}
</script>

<style scoped>
#cart-page {
  padding-bottom: 7em;
  position: relative;
}
#cart-page.expand {
  padding-bottom: 14em;
}
</style>
