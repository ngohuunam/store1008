<template>
  <img class="fit" :src="objectURL || loading" />
</template>

<script>
export default {
  name: 'image-load',
  props: ['prodId', 'hex', 'pid'],
  components: {},
  created() {
    this.loading = this.$store.state.url + 'loading.jpg'
    this.count = 1
  },
  mounted() {
    if (this.firstTime) this.fetchURL()
    else this.getBlob()
  },
  data() {
    return {
      loading: '',
      objectURL: null,
    }
  },
  methods: {
    getBlob() {
      // console.log(`${this.id}-${this.pid} get blob ${this.pid}`)
      this.$store
        .dispatch('getBlob', this.pid)
        .then(blob => {
          this.objectURL = URL.createObjectURL(blob)
        })
        .catch(() => {
          this.count++
          console.error(`${this.id}-${this.pid} count`, this.count)
          if (this.count < 5) {
            setTimeout(this.getBlob, 300)
          } else if (this.count > 4) {
            this.fetchURL()
          }
        })
    },
    fetchURL() {
      console.log(`${this.id}-${this.pid} start fetch`)
      fetch(this.url)
        .then(response => {
          return response.blob()
        })
        .then(blob => {
          this.objectURL = URL.createObjectURL(blob)
          if (!this.firstTime) this.$store.dispatch('saveBlob', { key: this.pid, value: { prod: this.prodId, hex: this.hex, blob: blob } })
        })
        .catch(e => console.error(`fetch ${this.pid} err`, e))
    },
  },
  computed: {
    id: {
      get() {
        return `${this.prodId}.${this.hex}`
      },
    },
    url: {
      get() {
        return this.$store.state.url + this.pid
      },
    },
    // loading: {
    //   get() {
    //     return this.$store.state.loading
    //   },
    // },
    firstTime: {
      get() {
        return this.$store.state.firstTime
      },
    },
  },
  beforeDestroy() {},
}
</script>

<style scoped>
</style>
