const { data } = require("../lib/data")
const { getAccount } = require("../lib/getAccount")
const { html } = require('../lib/html')
const { randomCode } = require("../lib/randomCode")
const { redirect } = require("../lib/redirect")
const { saveAccount } = require("../lib/saveAccount")

function error(message, email) {
 return html(`<div class="panel">
<h1>Oh no</h1>
<p>That didn't work because: ${message}</p>
<p><a class="button" target="_top" href="/#system/verify.html#email=${encodeURIComponent(email)}&unique=${randomCode(10)}">&laquo; Try again</a></p>
</div>`)
}

module.exports = {
 async verify(email, enteredCode) {
  const timestampNow = Date.now()
  try {
   const storageKey = `verify:${email}`
   const { code, timestamp } = await data.read(storageKey)
   if (timestampNow - timestamp > 15 * 60e3 /* 15 minutes */) {
    await data.remove(storageKey)
    return error('code was generated more than 15 minutes ago', email)
   }
   else if (code !== enteredCode) {
    return error('code did not match', email)
   }
   await data.remove(storageKey)
   const key = randomCode(40)
   await data.write(`key:${key}`, { email, timestamp: timestampNow })
   const account = await getAccount(key)
   if (!('accountId' in account)) {
    // new account
    await saveAccount({ email }, {})
   }
   return redirect(`system/welcome.html#email=${encodeURIComponent(email)}&key=${key}`)
  }
  catch (e) {
   return error(e.message, email)
  }
 }
}
