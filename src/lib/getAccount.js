const { data } = require('./data')

module.exports = {
 async getAccount(key, isAccountId) {
  try {
   const { email } = await data.read(`${isAccountId ? 'account' : 'key'}:${key}`)
   const profile = await data.read(`profile:${email}`)
   return { ...profile, email }
  }
  catch (e) {
   console.error(e)
   return {}
  }
 }
}
