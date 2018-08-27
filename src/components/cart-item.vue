<template>
  <div class="card cart">

    <!-- Header -->
    <div class="flex space-between">
      <div class="flex align-center">
        <button class="btn check" :class="{checked : item.check}" @click="$store.commit('toggleCheck', item.id)" />
        <div>#{{item.prodId}}</div>
      </div>
      <div class="flex">
        <div class="center text-red" v-if="item.order">Ordered</div>
        <transition name="fade">
          <button v-if="item.order" class="btn arrow-right" @click="$emit('routerPush', '/order')" />
        </transition>
        <button class="btn star" :class="{fill : hasStar}" @click="toggleStar" />
        <button class="btn close bg-right" @click="spliceCart" />
      </div>
    </div>

    <!-- Body -->
    <div class="flex space-between">
      <!-- Slider image left side area -->
      <div class="flex-30">
        <ImageLoad class="from-to-top active-absolute fit center" :prodId="item.prodId" :hex="item.hex" :pid="info.img" :key="info.img" @click.native="openSlider" />
      </div>

      <!-- right side area -->
      <div class="col flex-65">

        <!-- Color select row -->
        <div class="flex-1 align-center">
          <div class="flex-40">Color: </div>
          <select :value="item.hex" class="flex-1" @change="cartChangeProperty($event.target.value, item.size)">
            <option disabled value="">Select one</option>
            <option v-for="c_info in info.colorInfo" :key="c_info.value" :value="c_info.value">{{c_info.label}}</option>
          </select>
        </div>

        <!-- Size select row -->
        <div class="flex-1 align-center">
          <div class="flex-40">Size: </div>
          <select :value="item.size" class="flex-1" @change="cartChangeProperty(item.hex, $event.target.value)">
            <option disabled value="">Select one</option>
            <option v-for="s_info in info.sizeInfo" :key="s_info.label" :value="s_info.label">{{s_info.label}} - {{s_info.value}}</option>
          </select>
        </div>

        <!-- Quantity row -->
        <div class="flex-1 align-center">
          <div class="flex-40">Quantity: </div>
          <div class="flex-1 align-end">
            <button class="btn minus shadow" :disabled="item.cart < 2" @click="changeCart(-1)" />
            <div class="flex-1 m-x-8 relative">
              <input class="height-16 text-center" :class="{'text-red': outStock}" :value="currentValue" readonly/>
              <transition name="bounce">
                <button v-if="outStock" class="btn warning icon-white badge btn-classic round shadow" @click="$store.dispatch('pushMess')" />
              </transition>
            </div>
            <button class="btn plus shadow" @click="changeCart(1)" />
          </div>
        </div>

        <!-- Price row -->
        <div class="flex-1 align-end space-between">
          <div>Price: </div>
          <div> {{price}} </div>
        </div>

        <!-- Payment amount row -->
        <div class="flex-1 align-end space-between border-top">
          <div> Amount: </div>
          <div class="text-bold"> {{amount}} </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import ImageLoad from '@/components/image-load.vue'

export default {
  name: 'cart-item',
  props: ['item', 'index'],
  components: { ImageLoad },
  data() {
    return {}
  },
  created() {},
  methods: {
    toggleStar() {
      const info = {
        id: this.item.id,
        prodId: this.item.prodId,
        hex: this.item.hex,
        size: this.item.size,
      }
      this.$store.commit('toggleStar', info)
    },
    openSlider() {
      const currentId = this.item.id
      const info = {
        newId: '',
        currentId: currentId,
        prodId: this.item.prodId,
        hex: this.item.hex,
        size: this.item.size,
        quantity: this.item.cart,
      }
      this.$store.commit('sliderData', { prodId: this.item.prodId, hex: this.item.hex, img_i: this.item.img_i, info: info })
    },
    cartChangeProperty(hex, size) {
      const newId = `${this.item.prodId}-${hex}_${size}`
      const info = {
        newId: newId,
        currentId: this.item.id,
        prodId: this.item.prodId,
        hex: hex,
        size: size,
        quantity: this.item.cart,
      }
      this.$store.commit('cartChangeProperty', info)
    },
    spliceCart() {
      this.$emit('spliceCart', this.index)
      this.changeCart(-this.item.cart)
    },
    changeCart(amount) {
      const info = {
        des: 'cart',
        id: this.item.id,
        amount: amount,
      }
      this.$store.commit('change', info)
    },
  },
  computed: {
    remain: {
      get() {
        return this.$store.getters.remain(this.item)
      },
    },
    currentValue: {
      get() {
        return `${this.item.cart}/${this.remain}`
      },
    },
    outStock: {
      get() {
        return this.info.stock < 1 ? true : this.remain - this.item.cart < 0
      },
    },
    price: {
      get() {
        return (this.info.price * 1000).toLocaleString('vi') + 'đ'
      },
    },
    amount: {
      get() {
        return (this.info.price * this.item.cart * 1000).toLocaleString('vi') + 'đ'
      },
    },
    hasStar: {
      get() {
        return this.$store.getters.hasStar(this.item.id)
      },
    },
    info: {
      get() {
        return this.$store.getters.cartItemInfo(this.item)
      },
    },
  },
}
</script>

<style>
</style>
