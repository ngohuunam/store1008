<template>
  <div class="modal-mask" @click="$emit('close')">
    <div class="modal" @click.stop>
      <button class="btn close absolute at-top at-right z-10" @click="$emit('close')" />
      <div class="form">
        <h2> Your information</h2>
        <div>
          <div class="flex-30">Name: *</div>
          <div class="flex-1"><input required :value="buyerInfo.name" @change="$store.commit('setBuyerInfo', { name: $event.target.value })" /></div>
        </div>
        <div>
          <div class="flex-30">Address: *</div>
          <div class="flex-1"><input required :value="buyerInfo.address" @change="$store.commit('setBuyerInfo', { address: $event.target.value })" /></div>
        </div>
        <div>
          <div class="flex-30">Phone: *</div>
          <div class="flex-1"><input type="tel" required :value="buyerInfo.phone" @change="$store.commit('setBuyerInfo', { phone: $event.target.value })" /></div>
        </div>
        <div>
          <div class="flex-30">Email: *</div>
          <div class="flex-1"><input type="email" required :value="buyerInfo.email" @change="$store.commit('setBuyerInfo', { email: $event.target.value })" /></div>
        </div>
        <div>
          <div class="flex-30">Password: *</div>
          <div class="flex-1"><input type="password" required :value="buyerInfo.pass" @change="$store.commit('setBuyerInfo', { pass: $event.target.value })" /></div>
        </div>
        <button :disabled="!valid" class="btn full-width bg green" @click="$emit('confirm')"> Confirm </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'modal',
  components: {},
  props: [],
  data() {
    return {}
  },
  created() {},
  methods: {},
  computed: {
    valid: {
      get() {
        return this.buyerInfo.name.length && this.buyerInfo.address.length && this.buyerInfo.phone.length && this.buyerInfo.email.length && this.buyerInfo.pass.length
      },
    },
    buyerInfo: {
      get() {
        return this.$store.state.buyerInfo
      },
    },
  },
  watch: {},
}
</script>

<style>
</style>
