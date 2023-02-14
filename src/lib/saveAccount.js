const { data } = require('./data')
const { randomCode } = require('./randomCode')

module.exports = {
 async saveAccount(account, newAccountData) {
  if (typeof account.email !== 'string') {
   throw new TypeError('account.email must be a string')
  }
  const accountId = account.accountId ?? randomCode(24) // todo: check for collisions in public
  await data.write(`profile:${account.email}`, {
   ...account,
   ...newAccountData,
   accountId,
   timestamp: Date.now()
  })
 }
}
