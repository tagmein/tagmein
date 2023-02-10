const MAX_REQUEST_BODY_SIZE = 1024 * 512 // 512kb

const [qs] = 'querystring'
 .split(' ').map(require)

module.exports = {
 async parseRequestBody(request) {
  return new Promise(function (resolve, reject) {
   let error = false
   const FORM_URLENCODED = 'application/x-www-form-urlencoded'
   if (request.headers['content-type'] === FORM_URLENCODED) {
    let body = ''
    request.on('data', function (chunk) {
     if (!error) {
      body += chunk.toString()
      if (body.length > MAX_REQUEST_BODY_SIZE) {
       error = true
       reject(new Error(`request body size cannot exceed ${MAX_REQUEST_BODY_SIZE} bytes`))
      }
     }
    })
    request.on('end', function () {
     if (!error) {
      resolve(qs.parse(body))
     }
    })
   } else {
    resolve({})
   }
  })
 }
}
