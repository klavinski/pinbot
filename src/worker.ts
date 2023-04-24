import initSyncSQLite from "sqlite-wasm-http/sqlite3.js"
import { z } from "zod"
import { queryParser } from "./popup/types.ts"
import { split } from "./utils.ts"

const cosineSimilarity = ( a: Float32Array, b: Float32Array ) => {
    let dot = 0
    let normA = 0
    let normB = 0
    for ( let i = 0; i < a.length; i ++ ) {
        dot += a[ i ] * b[ i ]
        normA += a[ i ] ** 2
        normB += b[ i ] ** 2
    }
    return dot / ( Math.sqrt( normA * normB ) )
}

const init = async () => {
    const sqlite = await initSyncSQLite()
    if ( "OpfsDb" in sqlite.oo1 && typeof sqlite.oo1.OpfsDb === "function" ) {
        // const db = new ( sqlite.oo1.OpfsDb as new ( filename: string, mode: string ) => DB )( "db", "c" )
        const db = new sqlite.oo1.DB()
        db.exec( "PRAGMA journal_mode = WAL; PRAGMA synchronous = normal; PRAGMA temp_store = memory; PRAGMA mmap_size = 30000000000;" )
        db.exec( "CREATE VIRTUAL TABLE IF NOT EXISTS pages USING FTS5 ( body, date UNINDEXED, title, url, tokenize=\"porter unicode61 remove_diacritics 2\" );" )
        db.exec( "CREATE TABLE IF NOT EXISTS pairs ( embeddings BLOB, text TEXT );" )
        return db
    } else
        throw new Error( "No OPFS." )
}
const db = init()

self.addEventListener( "message", async ( { data } ) => {
    const queryParsing = queryParser.and( z.object( { embeddings: z.instanceof( Float32Array ) } ) ).safeParse( data )
    if ( queryParsing.success ) {
        const { embeddings, exact, from, query, to, url } = queryParsing.data
        const pages = ( await db ).exec( `
        SELECT * FROM pairs, pages${ exact ? "( $1 )" : "" }
        WHERE url GLOB '*' || $2 || '*'
        ${ from ? `AND date >= DATE( '${ from }' )` : "" }
        ${ to ? `AND date <= DATE( '${ to }', '+1 day' )` : "" }
        AND text = body
        AND ( TRUE OR $1 = $1 )`, // otherwise, "SQLite3Error: Bind index is out of range." when not using $1
        { bind: [ exact, url ], returnValue: "resultRows", rowMode: "object" } )
        console.log( { pages, from, to } )
        const pagesWithScore = await Promise.all ( pages.map( async page => {
            // ( await db ).exec( "SELECT embeddings FROM pairs WHERE text = $1;", { bind: [ page.body ], returnValue: "resultRows", rowMode: "object" } )[ 0 ].score as number
            const score = cosineSimilarity( embeddings, new Float32Array( page.embeddings.buffer ) )
            return { ...page, score }
        } ) )
        pagesWithScore.sort( ( a, b ) => b.score - a.score )
        const pagesWithSentences = await Promise.all( pagesWithScore.map( async page => {
            const sentences = await Promise.all( [ page.title, ...split( page.body ) ].map( async sentence => ( { text: sentence, score: cosineSimilarity( embeddings, new Float32Array( ( await db ).exec( "SELECT embeddings FROM pairs WHERE text = $1;", { bind: [ sentence ], returnValue: "resultRows", rowMode: "object" } )[ 0 ].embeddings.buffer ) ) } ) ) )
            return { ...page, sentences }
        } ) )
        self.postMessage( { query, results: pagesWithSentences } )
    }
    const storeParsing = z.object( { store: z.object( { sentences: z.array( z.object( { embeddings: z.instanceof( Float32Array ), text: z.string() } ) ), body: z.string(), embeddings: z.instanceof( Float32Array ), title: z.string(), url: z.string() } ) } ).safeParse( data )

    if ( storeParsing.success ) {
        const { body, embeddings, sentences, title, url } = storeParsing.data.store;
        [ { embeddings, text: body }, ...sentences ].forEach( async ( { embeddings, text } ) => {
            ( await db ).exec( "INSERT INTO pairs ( embeddings, text ) VALUES ( $1, $2 );", { bind: [ embeddings.buffer, text ] } )
        } );
        ( await db ).exec( "INSERT INTO pages ( body, date, title, url ) VALUES ( $1, date( 'now' ), $2, $3);", { bind: [ body, title, url ] } )
        console.log( "current pages", ( await db ).exec( "SELECT * FROM pages;", { returnValue: "resultRows", rowMode: "object" } ) )
        console.log( "current sentences", ( await db ).exec( "SELECT * FROM pairs;", { returnValue: "resultRows", rowMode: "object" } ) )
    }
} )
