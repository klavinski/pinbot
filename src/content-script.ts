import * as browser from "webextension-polyfill"
const src = browser.runtime.getURL( "src/sandbox.html" )
const sb = browser.runtime.getURL( "src/sandbox.ts" )
console.log( sb )
window.addEventListener( "message", message => {
    console.log( message )
    message.source?.postMessage( { from: "content-script" } )
} )
const iframe = document.createElement( "iframe" )
iframe.src = src
iframe.className = "crx"

// iframe.style.display = "none"
document.body.appendChild( iframe )
console.log( iframe.contentWindow )
iframe.onload = () => {
    if ( iframe.contentWindow ) {
        console.log( "content window", iframe )
        iframe.contentWindow.postMessage( "test", "*" )
    } else
        console.log( "no content window", iframe )
}


import { Readability } from "@mozilla/readability"
const doc = new Readability( document ).parse()
console.log( doc )

browser.runtime.onMessage.addListener( ( message, sender ) => {
    console.log( message, sender )
} )
