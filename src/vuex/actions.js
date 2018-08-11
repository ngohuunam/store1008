export const pushMess = ({ commit }, mess) => {
  const message = mess || 'Out of stock, you can place order, we will try our best'
  commit('pushMess', message)
  setTimeout(() => commit('spliceMess', 0), 5000)
}
