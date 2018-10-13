<template>
  <div class="modal-mask">
    <!-- <button class="btn close absolute at-bot at-right z-top" @click="$emit('confirm')" /> -->
    <button class="btn classic absolute at-bot at-right z-top bg white" @click="$emit('confirm')"> CLOSE </button>
    <div class="modal full-height" :style="padTop">
      <div class="card sticky p-t-4" ref="sticky">
        <input v-if="area === 'street'" type="search" v-model="street" placeholder="Type Number - Street" ref="street" @input="typeAdd($event.target.value)" />
        <input v-else type="search" v-model="term" :placeholder="placeHolder" ref="filter" autofocus>
        <div class="relative p-a-4" v-if="ward">{{ward}}
          <button class="btn close absolute at-top at-right size-06" @click="clearAdd('ward')" />
        </div>
        <div class="relative p-a-4" v-if="district">{{district}}
          <button class="btn close absolute at-top at-right size-06" @click="clearAdd('district')" />
        </div>
        <div class="relative p-a-4" v-if="city">{{city}}
          <button class="btn close absolute at-top at-right size-06" @click="clearAdd('city')" />
        </div>
        <div class="flex" v-if="street">
          <button class="btn flex-1 bg green" @click="$emit('confirm', street, ward, district, city)"> Add New Address </button>
          <button class="btn flex-1 bg red" @click="clearAdd('city')"> Cancel </button>
        </div>
        <!-- <div class="relative" v-if="add">{{add}}
          <button class="btn close absolute at-top at-right size-06" @click="clearAdd('add')" />
        </div> -->
      </div>
      <div v-if="area !== 'street'" class="p-x-8">
        <div class="btn full-width border-bottom justify-start" v-for="(place, i) in filtered" :key="place+i" @click="select(place)"> {{place}} </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'add-address',
  components: {},
  props: [],
  data() {
    return {
      area: 'cities',
      filtered: [],
      term: '',
      add: '',
      city: '',
      cities: [],
      district: '',
      districts: [],
      ward: '',
      wards: [],
      padTop: '',
      street: '',
    }
  },
  created() {},
  mounted() {
    const cities = this.$store.state.cities
    this.cities = Object.keys(cities)
    this.filtered = this.cities
    this.calPadding()
    this.focus('filter')
  },
  methods: {
    calPadding() {
      this.$nextTick(() => {
        const offsetHeight = this.$refs.sticky.offsetHeight
        const paddingTop = offsetHeight * 2 + 12
        this.padTop = 'padding-top: ' + paddingTop + 'px'
      })
    },
    focus(des) {
      this.$nextTick(() => {
        this.$refs[des].focus()
      })
    },
    typeAdd(v) {
      this.add = `${v}, ${this.ward}, ${this.district}, ${this.city}`
    },
    clearAdd(place) {
      switch (place) {
        case 'ward':
          this.ward = ''
          this.area = 'wards'
          this.add = `, ${this.district}, ${this.city}`
          break
        case 'district':
          this.ward = ''
          this.district = ''
          this.area = 'districts'
          this.add = `, ${this.city}`
          break
        case 'city':
          this.ward = ''
          this.district = ''
          this.city = ''
          this.area = 'cities'
          this.add = ``
      }
      this.street = ''
      this.filtered = this[this.area]
      this.focus('filter')
    },
    expand(isAdd) {
      this.modal = isAdd ? 'Add' : 'List'
    },
    select(place) {
      switch (this.area) {
        case 'cities':
          this.area = 'districts'
          this.city = place
          this.districts = Object.keys(this.$store.state.cities[this.city])
          this.filtered = this.districts
          this.add = `, ${this.city}`
          this.focus('filter')
          break
        case 'districts':
          this.area = 'wards'
          this.district = place
          this.wards = this.$store.state.cities[this.city][this.district]
          this.filtered = this.wards
          this.add = `, ${this.district} ${this.add}`
          this.focus('filter')
          break
        case 'wards':
          this.area = 'street'
          this.ward = place
          this.add = `, ${this.ward} ${this.add}`
          this.focus('street')
      }
      this.term = ''
    },
    removeUnicode(text) {
      text = text.toLowerCase()
      text = text.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
      text = text.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
      text = text.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
      text = text.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
      text = text.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
      text = text.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
      text = text.replace(/đ/g, 'd')
      text = text.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
      text = text.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
      text = text.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
      text = text.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
      text = text.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
      text = text.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
      text = text.replace(/Đ/g, 'D')
      return text
    },
  },
  watch: {
    term: function(v) {
      if (v) {
        const term = this.removeUnicode(v)
        this.filtered = this[this.area].filter(place => {
          const _place = this.removeUnicode(place)
          return _place.indexOf(term) > -1
        })
      } else this.filtered = this[this.area]
    },
    area: function() {
      this.calPadding()
    },
  },
  computed: {
    placeHolder: {
      get() {
        let text = 'Type to filter '
        switch (this.area) {
          case 'cities':
            text += 'city / province'
            break
          case 'districts':
            text += 'district'
            break
          case 'wards':
            text += 'ward'
        }
        return text
      },
    },
  },
}
</script>

<style>
</style>
