import browser from "webextension-polyfill"

browser.runtime.sendMessage( { data: document.body.innerText, target: "offscreen" } )
