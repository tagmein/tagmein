const [path, qs] = 'path querystring'
 .split(' ').map(require)

const { ensureDirectoryExists } = require('../lib/ensureDirectoryExists')
const { randomCode } = require('../lib/randomCode')
const { redirect } = require('../lib/redirect')
const { saveFile } = require('../lib/saveFile')

const homeRoot = path.join(__dirname, '..', '..', 'public', 'home')

module.exports = {
 async createPost(account, requestBody) {
  const { path: postPath, title, content } = requestBody
  if (title?.length > 216) {
   throw new Error('title cannot be longer than 216 characters')
  }
  if (content?.length > 262144) {
   throw new Error('content cannot be longer than 262144 characters')
  }
  const timestamp = Date.now()
  const megaSeconds = Math.floor(timestamp / 1e9)
  const milliSeconds = timestamp % 1e9
  const myHome = `home/${account.accountId}`
  if (postPath !== myHome) {
   throw new Error('unauthorized')
  }
  const megaPath = path.join(homeRoot, account.accountId, megaSeconds.toString(10))
  await ensureDirectoryExists(megaPath)
  if (title?.length > 0) {
   const titleFilename = `${milliSeconds}.title=${encodeURIComponent(title)}`
   await saveFile(path.join(megaPath, titleFilename), '')
  }
  if (content?.length > 0) {
   const contentFilename = `${milliSeconds}.content`
   await saveFile(path.join(megaPath, contentFilename), content)
  }
  return redirect(`system/explore.html#${qs.encode({
   path: postPath,
   random: randomCode(12)
  })}`)
 }
}
