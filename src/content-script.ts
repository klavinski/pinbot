import * as browser from "webextension-polyfill"
const src = browser.runtime.getURL( "src/sandbox.html" )

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

// import init from "@geoffreylitt/wa-sqlite-async"

// export const initDB = ( async () => {
//     console.log( browser.runtime.getURL( "/wasm/wa-sqlite-async.wasm" ) )
//     const sqlite = await init( file => browser.runtime.getURL( "/wasm/wa-sqlite-async.wasm" ) )
//     const DB = await sqlite.open( ":memory:" )
//     await DB.exec( "CREATE VIRTUAL TABLE posts USING FTS5(title, body);" )
//     await DB.exec( `INSERT INTO posts(title,body)
//     VALUES('Learn SQlite FTS5','This tutorial teaches you how to perform full-text search in SQLite using FTS5'),
//     ('Advanced SQlite Full-text Search','Show you some advanced techniques in SQLite full-text searching'),
//     ('SQLite Tutorial','Help you learn SQLite quickly and effectively');` )
//     console.log( await DB.exec( "SELECT * FROM posts;" ) )
//     return DB
// } )()
