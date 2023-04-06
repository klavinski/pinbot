import browser from "webextension-polyfill"

let lastSentBody = ""

const sendBody = () => {
    const body = document.body.innerHTML
    if ( body !== lastSentBody ) {
        lastSentBody = body
        browser.runtime.sendMessage( { body: document.body.innerText } )
    }
}

browser.runtime.onMessage.addListener( sendBody )
