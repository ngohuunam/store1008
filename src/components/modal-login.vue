<template>
  <div class="modal-mask">
    <div class="modal">
      <button class="btn close absolute at-top at-right z-10" @click="$emit('confirm')" />
      <div class="form">
        <h2> Login information </h2>
        <div>
          <label for="phone" class="flex-30">Phone: *</label>
          <div class="flex-1"><input @keyup.enter="buyer._id ? '' : login()" v-focus type="tel" name="phone" required :value="buyer.phone" @input="$store.commit('setBuyerInfo', { phone: $event.target.value })" /></div>
        </div>
        <div>
          <label for="pass" class="flex-30">Password: *</label>
          <div class="flex-1"><input @keyup.enter="buyer._id ? '' : login()" type="password" name="pass" required :value="buyer.pass" @input="$store.commit('setBuyerInfo', { pass: $event.target.value })" /></div>
        </div>
        <div v-if="isRegister">
          <label for="name" class="flex-30">Name: *</label>
          <div class="flex-1"><input name="name" required :value="buyer.name" @input="$store.commit('setBuyerInfo', { name: $event.target.value })" /></div>
        </div>
        <div v-if="isRegister">
          <label for="email" class="flex-30">Email: *</label>
          <div class="flex-1"><input type="email" pattern="[a-zA-Z0-9.!#$%&amp;’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+" name="email" required :value="buyer.email" @input="$store.commit('setBuyerInfo', { email: $event.target.value })" /></div>
        </div>
        <div v-if="isRegister">
          <label for="add" class="flex-30">Address:</label>
          <div class="flex-1"><input type="text" name="add" :value="buyer.address" @input="$store.commit('setBuyerInfo', { address: $event.target.value })" /></div>
        </div>
        <div class="flex">
          <button :disabled="!buyer.phone || !buyer.pass" class="btn flex-1 bg green" @click="login"> {{buyer._id ? 'Logout' : 'Login'}} </button>
          <button :disabled="isRegister && (!buyer.phone || !buyer.pass || !buyer.name || !buyer.email)" class="btn flex-1 bg cyan" @click="register" v-if="!buyer._id"> Register </button>
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
    return {
      isRegister: false,
    }
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
      if (this.buyer._id) this.$store.commit('logout', this.buyer._id)
      else this.$store.commit('login', { phone: this.buyer.phone, pass: this.buyer.pass })
      this.$emit('confirm')
    },
    register() {
      if (this.isRegister) {
        this.$store.commit('register', this.buyer)
        this.$emit('confirm')
      } else this.isRegister = true
    },
  },
  computed: {
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
