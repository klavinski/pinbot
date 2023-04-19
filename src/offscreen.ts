import { z } from "zod"
import Worker from "./worker.ts?worker"
// import { createSQLiteThread } from "sqlite-wasm-http"

async function init() {
    // const db = await createSQLiteThread()
}

import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"
const sentences = ( text: string ) => winkNLP( model ).readDoc( text ).sentences().out()

const worker = new Worker()

import * as browser from "webextension-polyfill"
import { Query, queryParser, storeParser } from "./popup/types.ts"

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

const search = ( query: Query & { embeddings: Float32Array } ) => new Promise( async resolve => {
    const controller = new AbortController()
    worker.addEventListener( "message", ( { data } ) => {
        const parsing = z.object( { results: z.array( z.unknown() ) } ).safeParse( data )
        if ( parsing.success ) {
            controller.abort()
            resolve( parsing.data )
        }
    }, { signal: controller.signal } )
    worker.postMessage( query )
} )

chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    const queryParsing = queryParser.safeParse( message )
    if ( queryParsing.success ) {
        embed( queryParsing.data.query ).then( embeddings => search( { ...queryParsing.data, embeddings } ) ).then( sendResponse )
        return true
    }
    const storeParsing = storeParser.safeParse( message )
    const title = sender.tab?.title
    const url = sender.tab?.url
    if ( storeParsing.success && title && url ) {
        const text = [ title, url, storeParsing.data.body ].join( "\n" )
        Promise.all( sentences( text ).map( async sentence => ( { embeddings: await embed( sentence ), sentence } ) ) ).then( sentences =>
            worker.postMessage( { store: { sentences, text, title, url } } )
        )
    }
    console.log( "received in offscreen", message )
} )
