import browser from "webextension-polyfill"

( async () => {
    const url = browser.runtime.getURL( "src/offscreen.html" )
    if ( ( await clients.matchAll() ).every( _ => _.url !== url ) )
        chrome.offscreen.createDocument( {
            justification: "SQLite worker & WASM sandbox",
            reasons: [ chrome.offscreen.Reason.IFRAME_SCRIPTING ],
            url: browser.runtime.getURL( "src/offscreen.html" ),
        } )
} )()
