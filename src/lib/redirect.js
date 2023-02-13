module.exports = {
 redirect(to) {
  return {
   statusCode: 200,
   headers: [
    ['Content-Type', 'text/html']
   ],
   content: `<!doctype html><head><meta charset="utf-8"><script>top.location.replace('/#${to}')</script></head>`
  }
 }
}
