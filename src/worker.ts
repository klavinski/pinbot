import initSyncSQLite, { DB } from "sqlite-wasm-http/sqlite3.js"
import { z } from "zod"
import initSQLite from "./sqlite3-bundler-friendly.mjs"
import { queryParser } from "./popup/types.ts"

const init = async () => {
    const sqlite = await initSQLite()
    if ( "OpfsDb" in sqlite.oo1 && typeof sqlite.oo1.OpfsDb === "function" ) {
        sqlite.oo1.DB
        // const db = new ( sqlite.oo1.OpfsDb as new ( filename: string, mode: string ) => DB )( "db", "c" )
        const db = new sqlite.oo1.DB() as DB
        // db.exec( "PRAGMA journal_mode = WAL; PRAGMA synchronous = normal; PRAGMA temp_store = memory; PRAGMA mmap_size = 30000000000;" )
        db.exec( "CREATE TABLE IF NOT EXISTS pages (date INTEGER, embeddings BLOB, part INTEGER, sentence TEXT, title TEXT, url TEXT);" )
        // db.exec( "CREATE VIRTUAL TABLE IF NOT EXISTS pages USING FTS5 ( body, date, embeddings, title, url );" )
        return db
    } else
        throw new Error( "No OPFS." )
}
const db = init()

self.addEventListener( "message", async ( message ) => {
    const queryParsing = queryParser.and( z.object( { embeddings: z.instanceof( Float32Array ) } ) ).safeParse( message.data )
    if ( queryParsing.success ) {
        console.log( "querying" )
        const documents = ( await db ).exec( `
        SELECT date, title, url,
        1 - EXP( SUM( LOG( 1 - vector_cosim( embeddings, vector( '[${ queryParsing.data.query }]' ) ) ) ) / COUNT( * ) ) as score
        FROM pages
        GROUP BY date, title, url
        ORDER BY score DESC;`, { returnValue: "resultRows", rowMode: "object" } )
        const documentsWithRelevantSentences = await Promise.all( documents.map( async document => ( {
            ...document,
            sentences: ( await db ).exec( `WITH matches AS (
                    SELECT sentence, part,
                    vector_cosim( embeddings, vector( '[${ queryParsing.data.query }]' ) ) as score
                    FROM pages
                    WHERE date = $1 AND title = $2 AND url = $3
                    ORDER BY score DESC
                    LIMIT 3
                ) SELECT * FROM matches ORDER BY part;`, { bind: [ document.date, document.title, document.url ], returnValue: "resultRows", rowMode: "object" } )
        } ) ) )
        self.postMessage( { query: queryParsing.data.query, results: documentsWithRelevantSentences } )
    }
    const storeParsing = z.object( { store: z.object( { content: z.array( z.object( { embeddings: z.instanceof( Float32Array ), sentence: z.string() } ) ), title: z.string(), url: z.string() } ) } ).safeParse( message.data )
    if ( storeParsing.success ) {
        const date = Date.now()
        const { content, title, url } = storeParsing.data.store
        content.forEach( async ( { embeddings, sentence }, part ) => {
            ( await db ).exec( "INSERT INTO pages ( date, embeddings, part, sentence, title, url ) VALUES ( $1, vector($2), $3, $4, $5, $6 );", { bind: [ date, `[${ embeddings }]`, part, sentence, title, url ] } )
        } )
        console.log( "current pages", ( await db ).exec( "SELECT * FROM pages;", { returnValue: "resultRows", rowMode: "object" } ) )
    }
} )
