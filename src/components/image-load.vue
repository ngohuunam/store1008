<template>
  <div>
    <img class="fit" :src="objectURL || loading" />
  </div>
</template>

<script>
export default {
  name: 'image-load',
  props: ['prod', 'hex', 'url'],
  components: {},
  created() {
    this.count = 1
    const from = this.url.lastIndexOf('/') + 1
    const to = this.url.lastIndexOf('.')
    this.key = this.url.slice(from, to)
  },
  mounted() {
    if (this.firstTime) this.fetchURL()
    else this.getBlob()
  },
  data() {
    return {
      objectURL: null,
    }
  },
  methods: {
    getBlob() {
      this.$store
        .dispatch('getBlob', this.key)
        .then(blob => {
          this.objectURL = URL.createObjectURL(blob)
        })
        .catch(() => {
          this.count++
          console.error(`${this.id}-${this.key} count`, this.count)
          if (this.count < 10) {
            setTimeout(this.getBlob, 300)
          } else if (this.count > 9) {
            this.fetchURL()
          }
        })
    },
    fetchURL() {
      console.log(`${this.id}-${this.key} start fetch`)
      fetch(this.url)
        .then(response => {
          return response.blob()
        })
        .then(blob => {
          this.objectURL = URL.createObjectURL(blob)
          if (!this.firstTime) this.$store.dispatch('saveBlob', { key: this.key, value: { id: this.id, url: this.url, blob: blob } })
        })
        .catch(e => console.error(`fetch ${this.url} err`, e))
    },
  },
  computed: {
    id: {
      get() {
        return `${this.prod}.${this.hex}`
      },
    },
    loading: {
      get() {
        return this.$store.state.loading
      },
    },
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
