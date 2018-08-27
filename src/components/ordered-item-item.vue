<template>
  <div class="card">
    <div class="flex space-between">
      <div class="flex-10">
        <ImageLoad class="fit" :pid="item.img" :prod="item.name" :hex="item.hex"  />
      </div>
      <div class="col flex-85 align-end">
        <div class="flex-1 align-end"> #{{item.prodId}} </div>
        <div class="flex-1 align-end"> {{item.info}} </div>
        <div class="flex-1 align-end"> {{item.amount}} </div>
      </div>
    </div>
  </div>
</template>

<script>
import ImageLoad from '@/components/image-load.vue'

export default {
  name: 'ordered-item',
  props: ['item'],
  components: { ImageLoad },
  data() {
    return {}
  },
  mounted() {},
  methods: {},
  computed: {},
}
</script>

<style>
</style>
