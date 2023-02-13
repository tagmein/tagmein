const { data } = require('./data')

module.exports = {
 async getAccount(key) {
  try {
   const { email } = await data.read(`key:${key}`)
   const profile = await data.read(`profile:${email}`)
   return { ...profile, email }
  }
  catch (e) {
   console.error(e)
  }
 }
}
