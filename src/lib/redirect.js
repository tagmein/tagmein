module.exports = {
 redirect(to) {
  return {
   statusCode: 200,
   headers: [
    ['Content-Type', 'text/html']
   ],
   content: `<script>top.location.replace('/#${to}')</script>`
  }
 }
}
