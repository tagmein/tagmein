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
