import * as browser from "webextension-polyfill";
const src = browser.runtime.getURL('src/sandbox.html')
const sb = browser.runtime.getURL('src/sandbox.ts')
console.log(sb)
const iframe = document.createElement('iframe')
iframe.src = src
iframe.className = "crx"
iframe.onload = () => { iframe.contentWindow?.postMessage({ type: "init", src: sb }, "*")
}
document.body.appendChild(iframe)
console.log(iframe)
