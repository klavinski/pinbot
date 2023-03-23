import * as browser from "webextension-polyfill";
const src = browser.runtime.getURL('src/sandbox.html')
const sb = browser.runtime.getURL('src/sandbox.ts')
console.log(sb)
window.addEventListener('message', message => {
   //console.log(message)
    message.source?.postMessage({ from: "content-script" })
})
const iframe = document.createElement('iframe')
iframe.src = src
iframe.className = "crx"
setTimeout(() => { 
    const contentWindow = iframe.contentWindow
    if (contentWindow) 
    contentWindow.postMessage({ type: "test", src: sb }, "*")
    else
    console.log("no content window", iframe)
    }, 5000)

iframe.style.display = "none"
document.body.appendChild(iframe)
console.log(iframe.contentWindow)
if ( iframe.contentWindow ) {
    iframe.contentWindow.postMessage({ type: "test", src: sb }, "*")
} else
console.log("no content window", iframe)

import { Readability } from "@mozilla/readability"
browser.runtime.onConnect.addListener(port => {
    console.log(port)
})
const doc = new Readability(document).parse()
console.log(doc)
