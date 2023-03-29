import { Readability } from "@mozilla/readability"
import * as browser from "webextension-polyfill"
const src = browser.runtime.getURL( "src/sandbox.html" )
browser.runtime.getURL( "src/sandbox.ts" )

const iframe = document.createElement( "iframe" )
iframe.src = src
iframe.style.display = "none"

const sandbox = new Promise<( message: unknown ) => void>( ( resolve, reject ) => {
    document.body.appendChild( iframe )
    window.addEventListener( "message", ( message ) => {
        if ( message.data === "ready" ) {
            console.log( "sandbox ready", message )
            document.querySelectorAll( "iframe" ).forEach( node => {
                const contentWindow = node.contentWindow
                if ( node.src === src )
                    if ( contentWindow )
                        resolve( ( message: unknown ) => contentWindow.postMessage( message, "*" ) )
                    else
                        reject( "no contentWindow" )
            } )
        }
    }, { once: true } )
} )

window.addEventListener( "message", ( message ) => {
    console.log( "message from sandbox", message )
    if ( message.data.result )
        browser.runtime.sendMessage( message.data )
} )

browser.runtime.onMessage.addListener( async message => {
    console.log( "message from popup", message );
    ( await sandbox )( { ...message, context: document.body.innerText } )
} )
