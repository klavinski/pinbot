import { z } from "zod"
import Worker from "./worker.ts?worker"
import { onBrowserMessageTo } from "./api.ts"
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

const sendMessage = ( message: unknown, to: string ) => new Promise( async resolve => {
    const uuid = crypto.randomUUID()
    const controller = new AbortController()
    window.addEventListener( "message", event => {
        const parseResult = z.object( { data: z.any(), to: z.literal( "offscreen" ), uuid: z.literal( uuid ) } )
            .safeParse( event.data )
        if ( "data" in parseResult ) {
            controller.abort()
            resolve( parseResult.data )
        }
        else
            console.log( event.data, "parsing in offscreen" )
    }, { signal: controller.signal } );
    ( await sandbox ).postMessage( { message, from: "offscreen", to, uuid }, "*" )
} )

const onMessage = onBrowserMessageTo( "offscreen" )
onMessage( async message => {
    console.log( message, "in offscreen" )
    if ( typeof message === "object" && message !== null && "query" in message ) {
        const { embeddings } = await sendMessage( message, "sandbox" )
        return embeddings
    }
    else
        console.log( message, "in offscreen" )
    return "handled message"
} )
