<template>
  <div class="card home" v-if="item">
    <div class="relative center overflow-hidden m-b-4">
      <!-- Top info -->
      <div class="absolute at-top flex space-between align-center height-25 full-width z-10">
        <div class="flex-1 align-center">
          <button class="btn star" :class="{fill : hasStar}" @click="toggleStar" />
          <div>#{{prodId}}</div>
        </div>
        <transition name="fade" mode="out-in">
          <div class="sale m-r-4 from-to-right" v-if="info.sale" :key="info.sale">{{info.sale}}</div>
        </transition>
      </div>

      <!-- Fly button -->
      <div class="fly-wrapper">
        <button :disabled="!countBagBySet.cart" class="btn bag round shadow bg white-06 m-l-4" :class="badgeClass.flyCart" @click="operate.des === 'cart' ? $emit('routerPush', '/cart') : operate = {des: 'cart'}">
          <transition name="bounce">
            <div v-if="countBagBySet.cart" class="badge bg green">{{countBagBySet.cart}}</div>
          </transition>
        </button>
        <button :disabled="!countBagBySet.order" class="btn order round shadow bg white-06 m-l-4" :class="badgeClass.flyOrder" @click="operate.des === 'order' ? $emit('routerPush', '/order') : operate = {des: 'order'}">
          <transition name="bounce">
            <div v-if="countBagBySet.order" class="badge bg cyan">{{countBagBySet.order}}</div>
          </transition>
        </button>
      </div>

      <!-- Image -->
      <transition name="fade" class="relative">
        <ImageLoad class="from-to-top active-absolute fit center" :prodId="prodId" :hex="imgHex" :key="imgHex" :pid="img" @click.native="$store.commit('setState', {des: 'sliderData', value: {prodId: prodId, hex: imgHex, img_i: 0}})" />
      </transition>

      <!-- Price -->
      <transition name="fade" mode="out-in">
        <div class="price-wrap from-to-bot" :key="info.price">
          <div class="price">{{info.price}}</div>
          <div class="text-line-through text-grey m-l-4" v-if="info.originalPrice">{{info.originalPrice}}</div>
        </div>
      </transition>
    </div>

    <!-- Color -->
    <div v-if="item && item.colorInfo.length" class="flex m-b-8">
      <button v-for="color in item.colorInfo" :key="color.label" @click="operate = {hex: color.value}" class="btn m-l-4 no-margin-first" :class="{selected: color.value === operate.hex}" :style="{ 'background-color' : color.value}">
        <transition name="bounce">
          <div v-if="countBagByHex(color.hex)[operate.des]" :key="operate.des" class="badge bg" :class="badgeClass.bg">{{countBagByHex(color.hex)[operate.des]}}</div>
        </transition>
        <div class="sale size-06 absolute at-bot at-right" v-if="checkSaleByHex(color.hex)">Sale!!</div>
      </button>
    </div>

    <!-- Size -->
    <transition name="fade" mode="out-in">
      <div v-if="operate.hex" class="flex m-b-8 to-right" key="btn">
        <transition-group name="bounce" tag="div" class="flex wrap">
          <button v-for="s in colorObj.sizes" :key="s.size" @click="sizeBtnClick(s)" class="btn m-r-4 ani-move active-absolute" :class="{selected: s.size === operate.size, 'text-red': quantity(s).remain < 1}">{{s.size}}
            <transition name="bounce">
              <div v-if="quantity(s)[operate.des]" :key="operate.des" class="badge bg" :class="badgeClass.bg">{{quantity(s)[operate.des]}}</div>
            </transition>
            <div class="sale size-06 absolute at-bot-over-2px at-right" v-if="s.sale">-{{s.sale}}%</div>
          </button>
        </transition-group>
      </div>
      <div v-else class="full-width height-2 flex align-center m-b-8 to-right" key="text"> Choose color </div>
    </transition>

    <!-- Button -->
    <div class="flex-1 align-end">
      <button :disabled="!valid.minus" :class="valid.minus ? 'yellow' : 'white'" class="btn minus bg" @click="change(-1, operate.des)" />
      <button :disabled="!valid.plus" :class="valid.plus ? 'green' : 'white'" class="btn flex-1 bg" @click="change(1, 'cart')">+Bag</button>
      <button :disabled="!valid.plus" :class="valid.plus ? 'cyan' : 'white'" class="btn flex-1 bg" @click="change(1, 'order')">+Order</button>
      <button :disabled="!valid.plus" :class="valid.plus ? 'red' : 'white'" class="btn flex-1 bg" @click="buy">BUY!!</button>
    </div>
  </div>
</template>

<script>
import ImageLoad from '@/components/image-load.vue'

export default {
  name: 'home-item',
  props: ['prodId'],
  components: { ImageLoad },
  created() {},
  mounted() {},
  data() {
    return {}
  },
  watch: {},
  methods: {
    sizeBtnClick(size) {
      this.operate = { size: size.size }
      if (this.quantity(size).remain < 1) {
        this.$store.dispatch('pushMess')
      }
    },
    buy() {
      this.change(1, 'order')
      this.$emit('routerPush', '/order')
    },
    quantity(size) {
      const id = `${this.prodId}-${this.operate.hex}_${size.size}`
      const quantity = this.$store.getters.quantity(id)
      const remain = size.stock - quantity.cart - quantity.order
      return { ...quantity, ...{ remain: remain } }
    },
    checkSaleByHex(hex) {
      return this.item.colors.some(color => color.hex === hex && color.sizes.some(size => size.sale))
    },
    countBagByHex(hex) {
      const term = `${this.prodId}-${hex}_`
      return this.$store.getters.countBagByTerm(term)
    },
    toggleStar() {
      const id = `${this.prodId}-${this.operate.hex}_${this.operate.size}`
      const info = {
        id: id,
        prodId: this.prodId,
        hex: this.operate.hex,
        size: this.operate.size,
      }
      this.$store.commit('toggleStar', info)
    },
    change(amount, des) {
      this.operate = { des: des }
      const id = `${this.prodId}-${this.operate.hex}_${this.operate.size}`
      const checkBag = this.$store.getters.quantity(id)
      if (checkBag.has) {
        const info = {
          id: id,
          des: des,
          amount: amount,
        }
        this.$store.commit('change', info)
      } else {
        const item = {
          id: id,
          _id: this.sizeObj._id,
          _rev: this.sizeObj._rev,
          prodId: this.prodId,
          hex: this.operate.hex,
          label: this.colorObj.label,
          size: this.operate.size,
          img_i: this.operate.img_i,
          cart: des === 'cart' ? amount : 0,
          order: des === 'order' ? amount : 0,
          check: false,
          priceAtAdd: this.sizeObj.price,
          saleAtAdd: this.sizeObj.sale,
          key: Date.now(),
        }
        this.$store.commit('pushState', { des: 'bag', value: item })
      }
    },
  },
  computed: {
    imgHex: {
      get() {
        return this.operate.hex || this.item.colors[0].value
      },
    },
    badgeClass: {
      get() {
        const bg = this.operate.des ? (this.operate.des === 'cart' ? ' green' : ' cyan') : ''
        const flyCart = this.countBagBySet.cart ? `fill${this.operate.des === 'cart' ? ' green icon-white' : ''}` : ''
        const flyOrder = this.countBagBySet.order ? `fill${this.operate.des === 'order' ? ' cyan icon-white' : ''}` : ''
        return { bg: bg, flyCart: flyCart, flyOrder: flyOrder }
      },
    },
    operate: {
      get() {
        return this.$store.getters.homeItemInfo(this.prodId)
      },
      set(value) {
        this.$store.commit('operate', { prodId: this.prodId, value: value })
      },
    },
    valid: {
      get() {
        const plus = this.operate.hex && this.operate.size && this.colorObj.sizes.some(size => size.size === this.operate.size)
        const minus = plus && this.quantity(this.sizeObj)[this.operate.des]
        return { plus: plus, minus: minus }
      },
    },
    info: {
      get() {
        let price = this.item.priceInfo || ''
        let sale = this.item.saleInfo || ''
        if (this.colorObj) {
          price = this.colorObj.priceInfo
          sale = this.colorObj.saleInfo
          if (this.sizeObj) {
            sale = this.sizeObj.sale ? `-${this.sizeObj.sale}%` : 0
            const value = this.sizeObj.price * ((100 - this.sizeObj.sale) / 100)
            price = (value * 1000).toLocaleString('vn') + 'đ'
            const originalPrice = this.sizeObj.sale ? (this.sizeObj.price * 1000).toLocaleString('vn') + 'đ' : 0
            return { price: price, originalPrice: originalPrice, sale: sale }
          }
        }
        return { price: price, originalPrice: 0, sale: sale }
      },
    },
    img: {
      get() {
        return this.colorObj ? this.colorObj.imgs[this.operate.img_i] : this.item.colors[0].imgs[0]
      },
    },
    sizeObj: {
      get() {
        return this.operate.size ? this.colorObj.sizes.find(_size => _size.size === this.operate.size) : null
      },
    },
    colorObj: {
      get() {
        return this.operate.hex ? this.item.colors.find(_color => _color.value === this.operate.hex) : null
      },
    },
    countBagBySet: {
      get() {
        return this.$store.getters.countBagByTerm(`${this.prodId}-`)
      },
    },
    hasStar: {
      get() {
        return this.$store.getters.hasStar(`${this.prodId}-`)
      },
    },
    item: {
      get() {
        return this.$store.getters.prod(this.prodId)
      },
    },
  },
  beforeDestroy() {},
}
</script>

<style>
</style>
