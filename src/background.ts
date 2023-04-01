import browser from "webextension-polyfill"

chrome.runtime.onMessage.addListener( message => {
    console.log( "message from background", message )
} )

chrome.offscreen.createDocument( {
    justification: "",
    reasons: [ chrome.offscreen.Reason.IFRAME_SCRIPTING ],
    url: browser.runtime.getURL( "src/offscreen.html" ),
} )
