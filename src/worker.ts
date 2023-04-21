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
        db.exec( "PRAGMA journal_mode = WAL; PRAGMA synchronous = normal; PRAGMA temp_store = memory; PRAGMA mmap_size = 30000000000;" )
        db.exec( "CREATE VIRTUAL TABLE IF NOT EXISTS pages USING FTS5 ( body, date UNINDEXED, title, uuid UNINDEXED, url, tokenize=\"trigram\" );" )
        db.exec( "CREATE TABLE IF NOT EXISTS sentences ( embeddings BLOB, sentence TEXT, uuid TEXT );" )
        return db
    } else
        throw new Error( "No OPFS." )
}
const db = init()
self.addEventListener( "message", async ( { data } ) => {
    const queryParsing = queryParser.and( z.object( { embeddings: z.instanceof( Float32Array ).nullable() } ) ).safeParse( data )
    if ( queryParsing.success ) {
        const { embeddings, exact, from, query, to, url } = queryParsing.data
        const pages = ( await db ).exec( `
        WITH matched_pages AS (
            SELECT * FROM pages
            WHERE ( LENGTH( $2 ) = 0 OR url GLOB '*' || $1 || '*' )
            AND (
                LENGTH( $2 ) = 0 OR
                LENGTH( $2 ) < 3 AND pages LIKE '%' || $2 || '%' OR
                LENGTH( $2 ) >= 3 AND pages MATCH $2
            )
            ${ from ? `AND date >= DATE( '${ from }' )` : "" }
            ${ to ? `AND date <= DATE( '${ to }', '+1 day' )` : "" }
        ) SELECT p.*,
        1 - EXP( SUM( LOG( 1 - MAX( MIN( vector_cosim( embeddings, vector( $3 ) ), 1 ), 0 ) ) ) / COUNT( sentence ) ) AS score
        FROM matched_pages p JOIN sentences s ON p.uuid = s.uuid
        GROUP BY p.uuid ORDER BY score DESC;`, { bind: [ url, exact, `[ ${ embeddings } ]` ], returnValue: "resultRows", rowMode: "object" } )
        console.log( { pages, from, to } )
        const pagesWithSentences = await Promise.all( pages.map( async page => ( {
            ...page,
            sentences: ( await db ).exec( "SELECT sentence, MAX( MIN( vector_cosim( embeddings, vector( $1 ) ), 1 ), 0 ) AS score FROM sentences WHERE uuid = $2;", { bind: [ `[ ${ queryParsing.data.embeddings } ]`, page.uuid ], returnValue: "resultRows", rowMode: "object" } ) } ) ) )
        self.postMessage( { query, results: pagesWithSentences } )
    }
    const storeParsing = z.object( { store: z.object( { sentences: z.array( z.object( { embeddings: z.instanceof( Float32Array ), sentence: z.string() } ) ), body: z.string(), title: z.string(), url: z.string() } ) } ).safeParse( data )

    if ( storeParsing.success ) {
        const { sentences, body, title, url } = storeParsing.data.store
        const pageVisitUuid = crypto.randomUUID()
        sentences.forEach( async ( { embeddings, sentence } ) => {
            ( await db ).exec( "INSERT INTO sentences ( embeddings, sentence, uuid ) VALUES ( vector( $1 ), $2, $3 );", { bind: [ `[ ${ embeddings } ]`, sentence, pageVisitUuid ] } )
        } );
        ( await db ).exec( "INSERT INTO pages ( body, date, title, uuid, url ) VALUES ( $1, date( 'now' ), $2, $3, $4 );", { bind: [ body, title, pageVisitUuid, url ] } )
        console.log( "current pages", ( await db ).exec( "SELECT * FROM pages;", { returnValue: "resultRows", rowMode: "object" } ) )
        console.log( "current sentences", ( await db ).exec( "SELECT * FROM sentences;", { returnValue: "resultRows", rowMode: "object" } ) )
    }
} )
