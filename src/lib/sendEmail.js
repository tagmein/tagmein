const SENDINBLUE_API_URI = 'https://api.sendinblue.com/v3/smtp/email'
const { SENDINBLUE_API_KEY } = process.env

const sender = {
 name: 'Tag Me In',
 email: 'service@tagme.in'
}

module.exports = {
 async sendEmail(toName, toEmail, subject, htmlContent) {
  if (!toEmail || toEmail.length === 0) {
   throw new Error('email address was not provided')
  }
  else if (toEmail.length < 5 || !toEmail.includes('@') || !toEmail.includes('.')) {
   throw new Error('email address is not valid')
  }
  const body = JSON.stringify({
   sender,
   subject,
   htmlContent,
   headers: {
    charset: 'utf-8'
   },
   to: [
    { email: toEmail, name: toName }
   ],
  })
  const headers = {
   accept: 'application/json',
   'api-key': SENDINBLUE_API_KEY,
   'content-length': body.length,
   'content-type': 'application/json'
  }
  const response = await fetch(SENDINBLUE_API_URI, {
   body,
   method: 'POST',
   headers
  })
  const responseBody = await response.json()
  if (!response.ok) {
   if (responseBody.message.includes('not valid')) {
    throw new Error('email address is not valid')
   }
   else {
    throw new Error(responseBody?.message ?? 'an unknown error occurred')
   }
  }
 }
}
