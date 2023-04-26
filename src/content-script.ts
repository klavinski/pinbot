import browser from "webextension-polyfill"

const delay = 1000
const frequency = 60 * 1000
const sendBody = () => browser.runtime.sendMessage( { body: document.body.innerText } )

setTimeout( () => {
    sendBody()
    setInterval( sendBody, frequency )
}, delay )
