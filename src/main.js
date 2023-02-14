#!/bin/env -S node

const [http, fs, path, qs] = 'http fs path querystring'
 .split(' ').map(require)

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

async function finalPath(filePath) {
 return new Promise(function (resolve, reject) {
  fs.stat(filePath, function (err, data) {
   if (err) {
    reject(err)
   }
   else {
    if (data.isDirectory()) {
     resolve(path.join(filePath, 'main.html'))
    }
    else {
     resolve(filePath)
    }
   }
  })
 })
}

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
    return redirect(`system/profile.html#${qs.encode(account)}`)
   }
   return redirect('system/register.html')
  case 'POST /register':
   return register(requestBody.email)
  case 'POST /verify':
   return verify(requestBody.email, requestBody.code)
  default:
   if (requestMethod !== 'GET') {
    return html('<div class="message"><span>Method not allowed</span></div>', 400)
   }
   try {
    const filePath = await finalPath(path.join(rootPath, requestPath))
    return replyWithFile(filePath)
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
   } = await reply(requestMethod, requestPath, requestParams, requestBody, request.headers)
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
