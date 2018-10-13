<template>
  <div class="modal-mask">
    <div class="modal">
      <button class="btn close absolute at-top at-right z-10" @click="$emit('confirm')" />
      <div class="form">
        <h2> Receiver Info </h2>
        <div>
          <label for="name" class="flex-30"> Name: * </label>
          <input v-if="isChangeReceiver" name="name" required v-model="name">
          <div v-else class="flex-1">{{name}}</div>
        </div>
        <div>
          <label for="phone" class="flex-30"> Phone: * </label>
          <input v-if="isChangeReceiver" type="tel" name="phone" required v-model="phone">
          <div v-else class="flex-1">{{phone}}</div>
        </div>
        <div>
          <button class="btn flex-1 bg cyan" @click="changeReceiver"> {{isChangeReceiver ? 'Change' : 'Change Receiver'}} </button>
          <button v-if="isChangeReceiver" class="btn flex-1 bg red" @click="changeReceiver(false)"> Cancel </button>
        </div>
        <h2> Delievery Address</h2>
        <div class='no-pad'> {{address || 'Chưa có Địa chỉ giao hàng'}} </div>
        <button class="btn full-width bg m-b-8" @click="modifyAddress" :class="`${address ? 'green' : 'red'}`"> {{address ? 'Change Address' : 'Add address'}} </button>
        <button :disabled="!name || !phone || !address" class="btn full-width bg green" @click="confirm"> Place Order </button>
      </div>
    </div>
    <AddAddress v-if="changeAddress" @confirm="pickAddrress" />
  </div>
</template>

<script>
import AddAddress from '@/components/add-address.vue'

export default {
  name: 'modal-shipment-details',
  components: { AddAddress },
  props: [],
  data() {
    return {
      isChangeReceiver: false,
      name: '',
      phone: '',
      address: '',
      changeAddress: false,
      street: '',
      ward: '',
      district: '',
      city: '',
    }
  },
  created() {
    this.name = this.buyer.name.slice(0)
    this.phone = this.buyer.phone.slice(0)
    this.address = this.buyer.address.slice(0)
  },
  mounted() {},
  methods: {
    confirm() {
      const delieveryInfo = { name: this.name, phone: this.phone, street: this.street, ward: this.ward, district: this.district, city: this.city, address: this.address }
      this.$emit('confirm', delieveryInfo)
    },
    pickAddrress(street, ward, district, city) {
      this.changeAddress = false
      if (street) {
        this.ward = ward
        this.district = district
        this.city = city
        const add = `${street}, ${ward}, ${district}, ${city}`
        this.address = add
        console.log(add)
      }
    },
    modifyAddress() {
      this.changeAddress = true
    },
    changeReceiver(isCancel) {
      const name = this.name.slice(0)
      const phone = this.phone.slice(0)
      this.isChangeReceiver = !this.isChangeReceiver
      if (isCancel) {
        this.name = name
        this.phone = phone
      }
    },
  },
  watch: {},
  computed: {
    buyer: {
      get() {
        return this.$store.state.buyer
      },
    },
  },
}
</script>

<style>
</style>
