
<script>
export default {
  name: 'ordered',
  data() {
    return {
      show: false,
      itemList: [],
    }
  },
  mounted() {
    this.show = true
    this.timeout = null
    if (this.items.length) {
      this.pushList()
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  methods: {
    pushList() {
      const len = this.itemList.length
      clearTimeout(this.timeout)
      if (len < this.items.length) {
        this.itemList.push(len)
        this.timeout = setTimeout(this.pushList, 200)
      } else this.timeout = setTimeout(() => (this.done = true), 150)
    },
    routerPush(path) {
      this.itemList = []
      this.done = false
      this.show = false
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => this.$router.push(path), 350)
    },
  },
  computed: {
    items: {
      get() {
        return this.$store.state.ordered
      },
    },
  },
}
</script>
