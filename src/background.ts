import browser from "webextension-polyfill"

const run = async () => {
    await chrome.offscreen.createDocument( {
        justification: "",
        reasons: [ chrome.offscreen.Reason.IFRAME_SCRIPTING ],
        url: browser.runtime.getURL( "src/offscreen.html" ),
    } )
}

run()
