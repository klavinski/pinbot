import browser from "webextension-polyfill"

browser.runtime.sendMessage( { body: document.body.innerText } )
