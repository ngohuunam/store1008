import CITIES from '../cityList1'
const cities = Object.freeze(CITIES)
export default {
  cities: cities,
  firstTime: true,
  worker: false,
  imgWorker: false,
  socket: false,
  broadcastChannel: false,
  messageChannel: false,
  // loading: require('../assets/loading.jpg'),
  loader: true,
  shippingCost: 35,
  taxFee: 7,
  star: [],
  bag: [],
  ordered: [],
  buyer: { name: '', address: '', phone: '', email: '', pass: '', _id: '', _rev: '', at: '', orders: [] },
  homeItemInfo: [],
  sliderData: null,
  mess: [],
  prods: [],
  list: { _id: '', _rev: '', value: [] },
  url: 'https://res.cloudinary.com/dgprt0eay/image/upload/',
}
