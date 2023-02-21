const [fs, path] = 'fs path'
 .split(' ').map(require)

const { data } = require('./data')
const { randomCode } = require('./randomCode')
const { ensureDirectoryExists } = require('./ensureDirectoryExists')
const { saveFile } = require('./saveFile')
const { getAccount } = require('./getAccount')

const homeRoot = path.join(__dirname, '..', '..', 'public', 'home')

module.exports = {
 async saveAccount(account, newAccountData) {
  if (typeof account.email !== 'string') {
   throw new TypeError('account.email must be a string')
  }
  const { image, ...privateProfile } = newAccountData
  const accountId = account.accountId ?? randomCode(24) // todo: check for collisions in public
  const publicProfile = {
   accountId,
   bio: privateProfile.bio,
   name: privateProfile.name,
  }
  if (image?.data?.length > 0) {
   const { filename, data } = image
   const finalFilename = `profile-${randomCode(12)}${path.extname(filename)}`
   publicProfile.profileImage = privateProfile.profileImage = finalFilename
   const fullFinalPath = path.join(homeRoot, accountId, finalFilename)
   await ensureDirectoryExists(path.join(homeRoot, accountId))
   await saveFile(fullFinalPath, data)
  }
  else {
   publicProfile.profileImage = privateProfile.profileImage = account.profileImage
  }
  await saveFile(
   path.join(homeRoot, accountId, 'profile.json'),
   JSON.stringify(publicProfile)
  )
  const existingAccount = await getAccount(accountId, true)
  if (existingAccount?.email !== account.email) {
   await data.write(`account:${accountId}`, { email: account.email })
  }
  await data.write(`profile:${account.email}`, {
   ...account,
   ...privateProfile,
   accountId,
   timestamp: Date.now()
  })
 }
}
