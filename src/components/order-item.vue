<template>
  <div class="card cart">
    <div class="flex align-center space-between">
      <div>Name: {{item.name}}</div>
      <div class="flex">
        <button class="btn arrow-left bg-right" @click="backToCart" />
        <button class="btn star bg-right" :class="{fill : hasStar}" @click="toggleStar" />
        <button class="btn close bg-right" @click="spliceOrder" />
      </div>
    </div>
    <div class="flex space-between">
      <div class="flex-10">
        <ImageLoad class="fit" :prodId="item.prodId" :hex="item.hex" :pid="img" />
      </div>
      <div class="col flex-85 align-end">
        <div class="flex-1 align-end"> {{info}} </div>
        <div class="flex-1 align-end"> {{totalAmount}} </div>
      </div>
    </div>
  </div>
</template>

<script>
import ImageLoad from '@/components/image-load.vue'

export default {
  name: 'order-item',
  props: ['item', 'index'],
  components: { ImageLoad },
  data() {
    return {}
  },
  mounted() {},
  methods: {
    spliceOrder() {
      this.$emit('splice', this.index, true)
      const info = {
        des: 'order',
        _id: this.item._id,
        quantity: -this.item.order,
      }
      this.$store.commit('change', info)
    },
    toggleStar() {
      const info = {
        id: this.item.id,
        name: this.item.name,
        color: this.item.hex,
        size: this.item.size,
      }
      this.$store.commit('toggleStar', info)
    },
    backToCart() {
      this.$emit('splice', this.index, false)
      this.$store.commit('backToCart', this.item._id)
    },
  },
  computed: {
    hasStar: {
      get() {
        return this.$store.getters.hasStar(this.item.id)
      },
    },
    totalAmount: {
      get() {
        const price = this.$store.getters.itemPrice(this.item) * 1000
        const total = this.item.order * price
        return `${this.item.order} x ${price.toLocaleString('vi')}đ = ${total.toLocaleString('vi')}đ`
      },
    },
    info: {
      get() {
        return `Color: ${this.item.label}, Size: ${this.item.size}`
      },
    },
    img: {
      get() {
        return this.$store.getters.orderImg(this.item)
      },
    },
  },
}
</script>

<style>
</style>
