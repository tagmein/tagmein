const [fs, path] = 'fs path'
 .split(' ').map(require)

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

module.exports = {
 async replyWithFile(filePath) {
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
}
