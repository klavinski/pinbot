import initSyncSQLite, { DB } from "sqlite-wasm-http/sqlite3.js"
import { z } from "zod"
import initSQLite from "./sqlite3-bundler-friendly.mjs"

const init = async () => {
    const sqlite = await initSQLite()
    if ( "OpfsDb" in sqlite.oo1 && typeof sqlite.oo1.OpfsDb === "function" ) {
        sqlite.oo1.DB
        // const db = new ( sqlite.oo1.OpfsDb as new ( filename: string, mode: string ) => DB )( "db", "c" )
        const db = new sqlite.oo1.DB() as DB
        db.exec( "CREATE TABLE IF NOT EXISTS pages (body TEXT, date INTEGER, embeddings BLOB, title TEXT, url TEXT);" )
        // db.exec( "CREATE VIRTUAL TABLE IF NOT EXISTS pages USING FTS5 ( body, date, embeddings, title, url );" )
        db.exec( `INSERT INTO pages ( body, date, embeddings, title, url ) VALUES ( 'body',${ Date.now() }, vector('${ Array.from( { length: 384 }, _ => Math.random() ) }'), 'title', 'https://url' );` )
        return db
    } else
        throw new Error( "No OPFS." )
}
const db = init()

self.addEventListener( "message", async ( message ) => {
    const queryParsing = z.object( { query: z.instanceof( Float32Array ) } ).safeParse( message.data )
    if ( queryParsing.success ) {
        self.postMessage( { query: queryParsing.data.query, results: ( await db ).exec( `SELECT *, vector_cosim(embeddings, vector('[${ queryParsing.data.query }]')) as score FROM pages ORDER BY score DESC;`, { returnValue: "resultRows", rowMode: "object" } ) } )
    }
    const storeParsing = z.object( { store: z.object( { body: z.string(), title: z.string().nullable(), embeddings: z.instanceof( Float32Array ), url: z.string().nullable() } ) } ).safeParse( message.data )
    if ( storeParsing.success ) {
        const { body, title, embeddings, url } = storeParsing.data.store;
        ( await db ).exec( "INSERT INTO pages ( body, date, embeddings, title, url ) VALUES ( $1, $2, vector($3),$4, $5 );", { bind: [ body, Date.now(), `[${ embeddings }]`, title, url ] } )
        console.log( "current pages", ( await db ).exec( "SELECT * FROM pages;", { returnValue: "resultRows", rowMode: "object" } ) )
    }
} )
