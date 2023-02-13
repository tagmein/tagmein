const [fs, path] = 'fs path'
 .split(' ').map(require)

const dataRoot = path.join(__dirname, '..', '..', 'private', 'data')

if (!fs.existsSync(dataRoot)) {
 fs.mkdirSync(dataRoot, { recursive: true })
}

module.exports = {
 data: {
  async read(key) { },
  async write(key, value) {
   return new Promise(function (resolve, reject) {
    fs.writeFile(
     path.join(dataRoot, encodeURIComponent(key)),
     JSON.stringify(value),
     function (error) {
      if (error) {
       reject(error)
      }
      else {
       resolve()
      }
     }
    )
   })
  },
 }
}
