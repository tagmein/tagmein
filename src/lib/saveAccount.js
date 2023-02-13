const { data } = require('./data')

module.exports = {
 async saveAccount(email, profileData) {
  await data.write(`profile:${email}`, profileData)
 }
}
