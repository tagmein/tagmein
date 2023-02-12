#!/bin/env -S node

const [http, fs, path, qs] = 'http fs path querystring'
 .split(' ').map(require)

const { parseRequestBody } = require('./lib/parseRequestBody')

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

const contentTypes = {
 css: 'text/css',
 gif: 'image/gif',
 html: 'text/html',
 jpeg: 'image/jpeg',
 jpg: 'image/jpeg',
 js: 'application/javascript',
 json: 'application/json',
 png: 'image/png',
 svg: 'image/svg+xml',
}

async function replyWithFile(filePath) {
 return new Promise(function (resolve, reject) {
  fs.readFile(filePath, function (error, content) {
   if (error) {
    reject(error)
   }
   else {
    const type = path.extname(filePath).substring(1)
    resolve({
     statusCode: 200,
     headers: [
      ['Content-Type', contentTypes[type] ?? 'text/plain']
     ],
     content
    })
   }
  })
 })
}

function redirect(to) {
 return {
  statusCode: 301,
  headers: [
   ['Location', to]
  ]
 }
}

async function reply(requestMethod, requestPath, requestParams, requestBody, requestHeaders) {
 switch (requestPath) {
  case '/profile':
   return redirect('/system/register.html')
 }
 try {
  const filePath = await finalPath(path.join(rootPath, requestPath))
  return replyWithFile(filePath)
 }
 catch (e) {
  if (e.code === 'ENOENT') {
   return {
    statusCode: 404,
    content: '<div class="message"><span>Not found</span></div>'
   }
  }
  console.error(e)
  return {
   statusCode: 500,
   content: '<div class="message"><span>Server error</span></div>'
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
