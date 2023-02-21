const [path, qs] = 'path querystring'
 .split(' ').map(require)

const { data } = require('../lib/data')
const { ensureDirectoryExists } = require('../lib/ensureDirectoryExists')
const { randomCode } = require('../lib/randomCode')
const { redirect } = require('../lib/redirect')
const { saveFile } = require('../lib/saveFile')
const { sendEmail } = require('../lib/sendEmail')
const { getAccount } = require('../lib/getAccount')

const homeRoot = path.join(__dirname, '..', '..', 'public', 'home')

async function notifySubscribers(
 postPath,
 {
  account,
  title,
  timestamp,
  content,
  megaSeconds,
  milliSeconds
 }
) {
 const subscriptionKey = `subscription:${postPath}`
 const subscribers = Object.keys(await data.read(subscriptionKey))
 const fontStyle = "color: #242424; font-family: Tahoma, Verdana, Segoe, 'DejaVu Sans', sans-serif; font-size: 18px; line-height: 1.65;"
 const htmlContent = `<!doctype html>
 <html>
  <head>
   <meta charset="utf-8" />
  </head>
  <body style="${fontStyle}">
   <h2 style="margin-top: 0;">${title}</h2>
   <p style="${fontStyle}margin: 15px 0;">
    <span style="display: inline-block; margin-right: 10px;">
    <span style="height: 32px; width: 32px; border-radius: 100%; box-shadow: 0 0 0 1px #24242479; display: inline-block; background-color: #c9c9c9; margin-left: 2px; margin-right: 10px; background-repeat: no-repeat; background-size: cover; image-rendering: crisp-edges; image-rendering: pixelated; margin-right: 2px; vertical-align: -9px; background-image: url('https://tagme.in/home/${account.accountId}/${account.profileImage}');"></span>
    <a style="color: inherit; text-decoration: none; border-bottom: 1px solid;" target="_blank" href="https://tagme.in/#system/explore.html#path=${encodeURIComponent(postPath)}">${account.name}</a></span>
    <a style="color: inherit; text-decoration: none; border-bottom: 1px solid;" target="_top" href="https://tagme.in/#system/explore.html#path=${encodeURIComponent(`${postPath}/${megaSeconds}/${milliSeconds}`)}">${new Date(timestamp).toLocaleString().replace(/:\d\d\s/, ' ')}</a>
   </p>
   <div class="content">
    ${content.split('\n').map(x => `<p style="${fontStyle}margin: 15px 0;">${x}</p>`).join('\n')}
   </div>
  </body>
 </html>`
 const emailSubject = `${account.name} has a new post: ${title}`
 for (const subscriberId of subscribers) {
  const subscriberAccount = await getAccount(subscriberId, true)
  try {
   await sendEmail(
    subscriberAccount.name,
    subscriberAccount.email,
    emailSubject,
    htmlContent
   )
  }
  catch (e) {
   console.error(e)
  }
 }
}

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
  notifySubscribers(
   postPath,
   {
    account,
    title,
    content,
    timestamp,
    megaSeconds,
    milliSeconds
   }
  )
  return redirect(`system/explore.html#${qs.encode({
   path: postPath,
   random: randomCode(12)
  })}`)
 }
}
