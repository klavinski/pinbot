import browser from "webextension-polyfill"

chrome.offscreen.createDocument( {
    justification: "SQLite worker & WASM sandbox",
    reasons: [ chrome.offscreen.Reason.IFRAME_SCRIPTING ],
    url: browser.runtime.getURL( "src/offscreen.html" ),
} )

browser.tabs.onUpdated.addListener( ( tabId, { status } ) => {
    if ( status === "complete" )
        browser.tabs.sendMessage( tabId, "please send the page body to offscreen" )
} )
