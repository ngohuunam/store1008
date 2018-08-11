<template>
  <div id="app" :style="fontSize">
    <transition-group name="mess" tag="div" class="col flex-1">
      <div class="flex-1 center height-2 bg red relative p-a-4 m-b-4" v-for="(message, i) in mess" :key="message+i">
        <button class="btn close icon-white size-06 absolute at-top at-right" @click="$store.commit('spliceMess', i)" />{{message}}</div>
    </transition-group>
    <!-- <keep-alive include="home"> -->
    <router-view/>
    <!-- </keep-alive> -->
  </div>
</template>

<script>
import ws from './ws.js'

export default {
  name: 'App',
  components: {},
  created() {
    ws.$on('ws', (type, mess) => {
      // console.log(type, mess)
      let data
      let query = {}
      let current
      switch (type) {
        case 'onopen':
          query.type = 'list'
          query.doc = 'prod'
          query.current = this.$store.state.list
          ws.send(JSON.stringify(query))
          break
        case 'onmessage':
          data = JSON.parse(mess.data)
          console.log(data)
          switch (data.des) {
            case 'prod':
              if (data.changed) this.$store.commit('pushProd', data.data)
              current = this.$store.getters.currentItems(data.prodId)
              query = { type: 'query', des: 'colors', prodId: data.prodId, currents: current.colors }
              ws.send(JSON.stringify(query))
              break
            case 'colors':
              if (data.changed) this.$store.commit('pushColor', data.datas)
              current = this.$store.getters.currentItems(data.prodId)
              query = { type: 'query', des: 'items', prodId: data.prodId, currents: current.items }
              ws.send(JSON.stringify(query))
              break
            case 'items':
              if (data.changed) this.$store.commit('pushItem', data.datas)
              break
            case 'list':
              if (data.changed) this.$store.commit('fetchList', data)
              this.$store.state.list.forEach(id => {
                const prodRev = this.$store.getters.prodRev(id)
                ws.send(JSON.stringify({ type: 'query', des: 'prod', prodId: id, id: id, rev: prodRev }))
              })
          }
      }
    })
  },
  mounted() {
    const size = this.$el.clientWidth * 0.04
    this.fontSize = `font-size: ${size}px !important;`
  },
  data() {
    return {
      fontSize: 16,
    }
  },
  watch: {},
  methods: {},
  computed: {
    mess: {
      get() {
        return this.$store.state.mess
      },
    },
  },
  beforeDestroy() {
    ws.$off('ws')
  },
}
</script>

<style>
#app {
  width: 100%;
  max-width: 1200px;
  min-height: calc(100vh - 16px - 2.5em);
  margin: 0 auto;
  overflow-x: hidden;
  padding-top: 2.5em;
}
</style>
