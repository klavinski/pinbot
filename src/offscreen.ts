import { z } from "zod"
import Worker from "./worker.ts?worker"
// import { createSQLiteThread } from "sqlite-wasm-http"

async function init() {
    // const db = await createSQLiteThread()
    const worker = new Worker()
}

init()

import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"
const { readDoc } = winkNLP( model )

console.log( readDoc( "Hello world! How is it going?" ).sentences().out() )

import * as browser from "webextension-polyfill"

const iframe = document.querySelector( "iframe" )!
const sandbox = new Promise<Window>( ( resolve, reject ) => {
    window.addEventListener( "message", () => {
        iframe.contentWindow ? resolve( iframe.contentWindow ) : reject( "No contentWindow" )
    }, { once: true } )
} )
iframe.src = browser.runtime.getURL( "src/sandbox.html" )

const embed = ( text: string ) => new Promise<Float32Array>( async resolve => {
    const controller = new AbortController()
    window.addEventListener( "message", ( { data } ) => {
        try {
            const { embeddings } = z.object( { text: z.literal( text ), embeddings: z.instanceof( Float32Array ) } ).parse( data )
            controller.abort()
            resolve( embeddings )
        }
        catch ( e ) {}
    }, { signal: controller.signal } );
    ( await sandbox ).postMessage( text, "*" )
} )

chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    if ( typeof message === "object" && message !== null && "query" in message )
        embed( message.query ).then( sendResponse )
    else {
        const contentScriptParsed = z.object( { body: z.string() } ).safeParse( message )
        if ( "data" in contentScriptParsed )
            console.log( "storing", { body: contentScriptParsed.data.body, title: sender.tab?.title, embeddings: "TODO", url: sender.tab?.url } )
        else
            console.log( message, "misunderstood in offscreen" )
    }
    return true
} )
