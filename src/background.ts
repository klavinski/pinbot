( async () => {
    const url = chrome.runtime.getURL( "src/offscreen/index.html" )
    if ( ( await clients.matchAll() ).every( _ => _.url !== url ) )
        chrome.offscreen.createDocument( {
            justification: "Workers",
            reasons: [ chrome.offscreen.Reason.IFRAME_SCRIPTING ],
            url,
        } )
} )()
