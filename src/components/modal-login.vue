<template>
  <div class="modal-mask">
    <div class="modal">
      <button class="btn close absolute at-top at-right z-10" @click="$emit('close')" />
      <div class="form">
        <h2> Login information</h2>
        <div>
          <label for="phone" class="flex-30">Phone: *</label>
          <div class="flex-1"><input @keyup.enter="buyerId ? login : ''"  v-focus type="tel" name="phone" required :value="buyerInfo.phone" @input="$store.commit('setBuyerInfo', { phone: $event.target.value })" /></div>
        </div>
        <div>
          <label for="pass" class="flex-30">Password: *</label>
          <div class="flex-1"><input @keyup.enter="buyerId ? login : ''" type="password" name="pass" required :value="buyerInfo.pass" @input="$store.commit('setBuyerInfo', { pass: $event.target.value })" /></div>
        </div>
        <div class="flex">
          <button :disabled="!buyerInfo.phone || !buyerInfo.pass" class="btn flex-1 bg green" @click="login"> {{buyerId ? 'Logout' : 'Login'}} </button>
          <button :disabled="!buyerInfo.phone || !buyerInfo.pass" class="btn flex-1 bg cyan" @click="regiter" v-if="!buyerId"> Register </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'modal-login',
  components: {},
  props: [],
  data() {
    return {}
  },
  created() {},
  directives: {
    focus: {
      inserted: function(el) {
        el.focus()
      },
    },
  },
  methods: {
    login() {
      if (this.buyerId) this.$store.commit('logout', this.buyerId)
      else this.$store.commit('login', { phone: this.buyerInfo.phone, pass: this.buyerInfo.pass })
      this.$emit('close')
    },
    regiter() {
      this.$store.commit('register', this.buyerInfo)
      this.$emit('close')
    },
  },
  computed: {
    buyerInfo: {
      get() {
        return this.$store.state.buyerInfo
      },
    },
    buyerId: {
      get() {
        return this.$store.state.buyerId
      },
    },
  },
  watch: {},
}
</script>

<style>
</style>
