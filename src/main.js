#!/bin/env -S node

const [http, fs, path, qs] = 'http fs path querystring'
 .split(' ').map(require)

const { ensureDirectoryExists } = require('./lib/ensureDirectoryExists')
const { getAccount } = require('./lib/getAccount')
const { html } = require('./lib/html')
const { json } = require('./lib/json')
const { parseRequestBody } = require('./lib/parseRequestBody')
const { redirect } = require('./lib/redirect')
const { replyWithFile } = require('./lib/replyWithFile')
const { saveAccount } = require('./lib/saveAccount')

const { register } = require('./actions/register')
const { verify } = require('./actions/verify')

const portEnv = parseInt(process.env.PORT, 10)
const port = Number.isFinite(portEnv) && portEnv >= 1 && portEnv < 65536
 ? portEnv
 : 3000

const rootPath = path.join(__dirname, '..', 'public')

console.log('Serving', rootPath)

function unauthorized() {
 return html('<div class="message"><span>Not authorized</span></div>', 401)
}

async function reply(requestMethod, requestPath, requestParams, requestBody, requestHeaders) {
 const { key, ...requestBodyOther } = requestBody
 const accountKey = key ?? requestHeaders['x-key']
 const account = accountKey?.length > 0
  ? await getAccount(accountKey)
  : undefined
 switch (`${requestMethod} ${requestPath}`) {
  case 'GET /home':
   if (!account) {
    return unauthorized()
   }
   const homeDirectory = `home/${account.accountId}`
   await ensureDirectoryExists(path.join(rootPath, homeDirectory))
   return redirect(`system/explore.html#${qs.encode({ path: homeDirectory })}`)

  case 'POST /profile/update':
   if (!account) {
    return unauthorized()
   }
   await saveAccount(account, requestBodyOther)
   return redirect('profile')

  case 'GET /profile.json':
   if (!account) {
    return unauthorized()
   }
   return json(account)

  case 'GET /profile':
   if (account) {
    return redirect(`system/profile.html#${qs.encode({ key: accountKey, ...account })}`)
   }
   return redirect('system/register.html')

  case 'POST /register':
   return register(requestBody.email.toLowerCase())

  case 'POST /verify':
   return verify(requestBody.email.toLowerCase(), requestBody.code)

  case 'GET ':
   return replyWithFile(path.join(rootPath, 'main.html'))

  default:
   if (requestMethod !== 'GET') {
    return html('<div class="message"><span>Method not allowed</span></div>', 400)
   }
   try {
    return replyWithFile(path.join(rootPath, requestPath))
   }
   catch (e) {
    if (e.code === 'ENOENT') {
     return html('<div class="message"><span>Not found</span></div>', 404)
    }
    console.error(e)
    return html('<div class="message"><span>Server error</span></div>', 500)
   }
 }
}

async function main() {
 const server = http.createServer(async function (request, response) {
  try {
   const { method: requestMethod } = request
   const [requestPath, requestParamString] = request.url.split('?')
   const requestParams = qs.parse(requestParamString ?? '')
   console.log(requestMethod, requestPath, JSON.stringify(requestParams))
   const requestBody = await parseRequestBody(request)
   const {
    statusCode = 200,
    contentType = 'text/plain; charset=utf-8',
    content = '',
    headers = []
   } = await reply(
    requestMethod,
    requestPath.replace(/\/$/, ''), // important to prevent listing /home/
    requestParams,
    requestBody,
    request.headers
   )
   response.statusCode = statusCode
   response.setHeader('Content-Type', contentType)
   for (const [k, v] of headers) {
    response.setHeader(k, v)
   }
   response.write(content)
   response.end()
  }
  catch (e) {
   console.error(e)
   response.statusCode = e.statusCode ?? 500
   response.setHeader('Content-Type', 'text/plain; charset=utf-8')
   response.end(e.message)
  }
 })

 server.listen(port, 'localhost', function () {
  console.log(`Tag Me In server listening on http://localhost:${port}`)
 })
}

main().catch(function (e) {
 console.error(e)
})
