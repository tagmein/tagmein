const { data } = require("../lib/data")
const { html } = require('../lib/html')
const { randomCode } = require("../lib/randomCode")
const { redirect } = require("../lib/redirect")
const { sendEmail } = require("../lib/sendEmail")

module.exports = {
 async register(email) {
  const code = randomCode()
  const timestamp = Date.now()
  try {
   await sendEmail('New user', email, 'Sign in to Tag Me In', `
<body>
 <h1>Sign in to Tag Me In</h1>
 <p>Use the following code to complete sign in: <strong>${code}</strong></p>
 <p>The code is valid for 15 minutes.</p>
</body>
`)
   const storageKey = `verify:${email}`
   await data.write(storageKey, {
    code,
    timestamp
   })
   return redirect(`system/verify.html#email=${encodeURIComponent(email)}`)
  }
  catch (e) {
   return html(`<div class="panel">
<h1>Oh no</h1>
<p>That didn't work because: ${e.message}</p>
<p><a class="button" target="top" href="/#profile">&laquo; Back</a></p>
</div>`)
  }
 }
}
