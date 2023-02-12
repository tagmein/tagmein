async function main() {
 document.body.classList.remove('no-js')

 document.getElementById('tagmein-logo').setAttribute(
  'src', document.getElementById('favicon').getAttribute('href')
 )

 const TagMeIn = {
  content: document.getElementById('tagmein-content')
 }

 let activePath = ''

 async function navigate() {
  const { hash } = window.location
  const path = activePath = hash.length > 2 ? hash.replace(/^#/, '/') : '/home'

  TagMeIn.content.innerHTML = `<div class="message"><span>Loading "${path}"</span></div>`
  try {
   const response = await fetch(path)
   const content = await response.text()
   if (path === activePath) {
    TagMeIn.content.innerHTML = ''
    attachFrameWithContent(TagMeIn.content, content)
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

function attachFrameWithContent(attachTo, content) {
 const newFrame = document.createElement('iframe')
 attachTo.appendChild(newFrame)
 newFrame.contentDocument.open()
 newFrame.contentDocument.write(`<!doctype html>
<head>
 <meta charset="utf-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1" />
 <link href="/main.css" rel="stylesheet" type="text/css" />
 <script>
  window.addEventListener('message', function (message) {
   parent.postMessage(message.data)
  })
 </script>
 <style>body { display: none; }</style>
</head>
<body tabindex="0" class="display">${content}</body>`)
 newFrame.contentDocument.close()
 setTimeout(function () {
  newFrame.focus()
  newFrame.contentWindow.document.body.focus()
 }, 250)
}
