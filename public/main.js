function logout() {
 localStorage.removeItem('key')
 window.location.hash = '#profile'
}

async function main() {
 document.body.classList.remove('no-js')

 document.getElementById('tagmein-logo').setAttribute(
  'src', document.getElementById('favicon').getAttribute('href')
 )

 const TagMeIn = {
  content: document.getElementById('tagmein-content')
 }

 let activePath = ''
 window.activeKey = null

 function updateProfile(profile) {
  document.getElementById('profile-name').innerText = profile?.name ?? profile?.email ?? 'Guest'
  document.getElementById('profile-menu').style.display = profile?.email ? '' : 'none'
 }

 updateProfile()

 async function navigate() {
  const { hash } = window.location
  const [path, subHash] = hash.length > 2 ? hash.replace(/^#/, '/').split('#') : ['/home']
  activePath = path
  TagMeIn.content.innerHTML = `<div class="message"><span>Loading "${path}"</span></div>`
  try {
   const headers = {}
   const accountKey = localStorage.getItem('key')
   if (accountKey?.length > 0) {
    headers['x-key'] = accountKey
   }
   const response = await fetch(path, { headers })
   const content = await response.text()
   if (path === activePath) {
    TagMeIn.content.innerHTML = ''
    await attachFrameWithContent(
     TagMeIn.content,
     content,
     subHash
    )
    const key = localStorage.getItem('key')
    if (key !== window.activeKey ||
     location.hash.startsWith('#system/profile.html')) {
     window.activeKey = key
     const profileResponse = await fetch('/profile.json', {
      headers: { 'x-key': key }
     })
     updateProfile(await profileResponse.json())
    }
   }
  }
  catch (e) {
   if (path === activePath) {
    TagMeIn.content.innerHTML = `<div class="message">
 <span><strong>Error:</strong> "${e.message}"</span>
</div>`
   }
  }
 }
 window.addEventListener('hashchange', navigate)
 navigate()
}

window.addEventListener('DOMContentLoaded', main)

async function attachFrameWithContent(attachTo, content, contentParamString) {
 const newFrame = document.createElement('iframe')
 attachTo.appendChild(newFrame)
 newFrame.contentDocument.open()
 newFrame.contentDocument.write(
  content.startsWith('<!doctype html>')
   ? content
   : `<!doctype html>
<head>
 <meta charset="utf-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1" />
 <link href="/main.css" rel="stylesheet" type="text/css" />
 <script>
  window.addEventListener('message', function (message) {
   parent.postMessage(message.data)
  })
  window.urlParams = new URLSearchParams(${JSON.stringify(`?${contentParamString ?? ''}`)})
 </script>
 <style>body { display: none; }</style>
</head>
<body tabindex="0" class="display">${content}</body>`)
 newFrame.contentDocument.close()
 return new Promise(function (resolve) {
  setTimeout(function () {
   newFrame.focus()
   newFrame.contentWindow?.document?.body?.focus?.()
   resolve()
  }, 250)
 })
}
