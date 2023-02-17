const [fs, path] = 'fs path'
 .split(' ').map(require)

const { data } = require('./data')
const { randomCode } = require('./randomCode')
const { ensureDirectoryExists } = require('./ensureDirectoryExists')

const homeRoot = path.join(__dirname, '..', '..', 'public', 'home')

async function saveFile(filePath, contents) {
 return new Promise(function (resolve, reject) {
  fs.writeFile(filePath, contents, function (error) {
   if (error) {
    reject(error)
   }
   else {
    resolve()
   }
  })
 })
}

module.exports = {
 async saveAccount(account, newAccountData) {
  if (typeof account.email !== 'string') {
   throw new TypeError('account.email must be a string')
  }
  const { image, ...privateProfile } = newAccountData
  const accountId = account.accountId ?? randomCode(24) // todo: check for collisions in public
  const publicProfile = {
   bio: privateProfile.bio,
   name: privateProfile.name,
  }
  if (image) {
   const { filename, data } = image
   const finalFilename = `profile-${randomCode(12)}${path.extname(filename)}`
   publicProfile.profileImage = privateProfile.profileImage = finalFilename
   const fullFinalPath = path.join(homeRoot, accountId, finalFilename)
   await ensureDirectoryExists(path.join(homeRoot, accountId))
   await saveFile(fullFinalPath, data)
  }
  await saveFile(
   path.join(homeRoot, accountId, 'profile.json'),
   JSON.stringify(publicProfile)
  )
  await data.write(`profile:${account.email}`, {
   ...account,
   ...privateProfile,
   accountId,
   timestamp: Date.now()
  })
 }
}
