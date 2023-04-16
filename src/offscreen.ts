import { z } from "zod"
import Worker from "./worker.ts?worker"
// import { createSQLiteThread } from "sqlite-wasm-http"

async function init() {
    // const db = await createSQLiteThread()
}

const worker = new Worker()

import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"
const { readDoc } = winkNLP( model )

console.log( readDoc( "Hello world! How is it going?" ).sentences().out() )

import * as browser from "webextension-polyfill"
import { queryParser, storeParser } from "./popup/types.ts"

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

const query = ( query: Float32Array ) => new Promise( async resolve => {
    const controller = new AbortController()
    worker.addEventListener( "message", ( { data } ) => {
        const parsing = z.object( { query: z.instanceof( Float32Array ).refine( array => array.length === query.length && query.every( ( value, i ) => array[ i ] === value ) ), results: z.array( z.unknown() ) } ).safeParse( data )
        if ( parsing.success ) {
            controller.abort()
            resolve( parsing.data.results )
        }
    }, { signal: controller.signal } )
    worker.postMessage( { query } )
} )

chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
    const queryParsing = queryParser.safeParse( message )
    if ( queryParsing.success ) {
        embed( queryParsing.data.query ).then( query ).then( sendResponse )
        return true
    }
    const storeParsing = storeParser.safeParse( message )
    if ( storeParsing.success ) {
        const sentences = readDoc( storeParsing.data.body ).sentences().out()
        Promise.all( sentences.map( async sentence => ( { embeddings: await embed( sentence ), sentence } ) ) ).then( content =>
            worker.postMessage( { store: { content, title: sender.tab?.title ?? null, url: sender.tab?.url ?? null } } )
        )
    }
    console.log( "received in offscreen", message )
} )

import { apiAs } from "../api.ts"
const api = apiAs( "offscreen", {
    "popup": {
        addListener: browser.runtime.onMessage.addListener,
        send: browser.runtime.sendMessage
    }
} )
