( async () => {
    const url = chrome.runtime.getURL( "src/offscreen.html" )
    if ( ( await clients.matchAll() ).every( _ => _.url !== url ) )
        chrome.offscreen.createDocument( {
            justification: "DB worker & transformers.js environment",
            reasons: [ chrome.offscreen.Reason.IFRAME_SCRIPTING ],
            url: chrome.runtime.getURL( "src/offscreen.html" ),
        } )
} )()
