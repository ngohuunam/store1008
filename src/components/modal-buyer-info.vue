<template>
  <div class="modal-mask" @click="$emit('close')">
    <div class="modal" @click.stop>
      <button class="btn close absolute at-top at-right z-10" @click="$emit('close')" />
      <div class="form">
        <h2> Your information</h2>
        <div>
          <label for="name" class="flex-30">Name: *</label>
          <div class="flex-1"><input name="name" required :value="buyer.name" @input="$store.commit('setBuyerInfo', { name: $event.target.value })" /></div>
        </div>
        <div>
          <label for="address" class="flex-30">Address: *</label>
          <div class="flex-1"><input name="address" required :value="buyer.address" @input="$store.commit('setBuyerInfo', { address: $event.target.value })" /></div>
        </div>
        <div>
          <label for="phone" class="flex-30">Phone: *</label>
          <div class="flex-1"><input type="tel" name="phone" required :value="buyer.phone" @input="$store.commit('setBuyerInfo', { phone: $event.target.value })" /></div>
        </div>
        <div>
          <label for="email" class="flex-30">Email: *</label>
          <div class="flex-1"><input type="email" pattern="[a-zA-Z0-9.!#$%&amp;’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+" name="email" required :value="buyer.email" @input="$store.commit('setBuyerInfo', { email: $event.target.value })" /></div>
        </div>
        <div>
          <label for="pass" class="flex-30">Password: *</label>
          <div class="flex-1"><input type="password" name="pass" required :value="buyer.pass" @input="$store.commit('setBuyerInfo', { pass: $event.target.value })" /></div>
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
        return this.buyer.name.length && this.buyer.address.length && this.buyer.phone.length && this.buyer.email.length && this.buyer.pass.length
      },
    },
    buyer: {
      get() {
        return this.$store.state.buyer
      },
    },
  },
  watch: {},
}
</script>

<style>
</style>
