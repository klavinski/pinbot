import browser from "webextension-polyfill"

chrome.offscreen.createDocument( {
    justification: "SQLite worker & WASM sandbox",
    reasons: [ chrome.offscreen.Reason.IFRAME_SCRIPTING ],
    url: browser.runtime.getURL( "src/offscreen.html" ),
} )
