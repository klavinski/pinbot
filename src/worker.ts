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
        db.exec( "CREATE TABLE IF NOT EXISTS sentences ( embeddings BLOB, sentence TEXT, uuid TEXT );" )
        db.exec( "CREATE TABLE IF NOT EXISTS pages ( date TEXT, title TEXT, uuid TEXT, url TEXT);" )
        db.exec( "CREATE VIRTUAL TABLE IF NOT EXISTS fts USING FTS5 ( text, uuid UNINDEXED, tokenize=\"trigram\" );" )
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
        SELECT date, title, text, p.uuid, url,
        1 - EXP( SUM( LOG( 1 - MAX( MIN( vector_cosim( embeddings, vector( $1 ) ), 1 ), 0 ) ) ) / COUNT( sentence ) ) AS score
        FROM pages p, sentences s, fts f
        WHERE p.uuid = f.uuid AND p.uuid = s.uuid
        AND ( LENGTH( $2 ) = 0 OR url GLOB '*' || $2 || '*' )
        AND (
            LENGTH( $3 ) = 0 OR
            LENGTH( $3 ) < 3 AND f.text LIKE '%' || $3 || '%' OR
            LENGTH( $3 ) >= 3 AND f.text MATCH $3
        )
        AND ( $4 OR date >= DATE( $5 ) )
        AND ( $6 OR date <= DATE( $7, '+1 day' ) )
        GROUP BY p.uuid
        ORDER BY score DESC;`, { bind: [ `[ ${ embeddings }`, url, exact, from === null, from ?? 0, to === null, to ?? 0 ], returnValue: "resultRows", rowMode: "object" } )
        const pagesWithSentences = await Promise.all( pages.map( async page => ( {
            ...page,
            sentences: ( await db ).exec( "SELECT sentence, MAX( MIN( vector_cosim( embeddings, vector( $1 ) ), 1 ), 0 ) AS score FROM sentences WHERE uuid = $2;", { bind: [ `[ ${ queryParsing.data.embeddings } ]`, page.uuid ], returnValue: "resultRows", rowMode: "object" } ) } ) ) )
        self.postMessage( { query, results: pagesWithSentences } )
    }
    const storeParsing = z.object( { store: z.object( { sentences: z.array( z.object( { embeddings: z.instanceof( Float32Array ), sentence: z.string() } ) ), text: z.string(), title: z.string(), url: z.string() } ) } ).safeParse( data )

    if ( storeParsing.success ) {
        const { sentences, text, title, url } = storeParsing.data.store
        const pageVisitUuid = crypto.randomUUID()
        sentences.forEach( async ( { embeddings, sentence } ) => {
            ( await db ).exec( "INSERT INTO sentences ( embeddings, sentence, uuid ) VALUES ( vector( $1 ), $2, $3 );", { bind: [ `[ ${ embeddings } ]`, sentence, pageVisitUuid ] } )
        } );
        ( await db ).exec( "INSERT INTO pages ( date, title, uuid, url ) VALUES ( date( 'now' ), $1, $2, $3 );", { bind: [ title, pageVisitUuid, url ] } );
        ( await db ).exec( "INSERT INTO fts ( text, uuid ) VALUES ( $1, $2 );", { bind: [ text, pageVisitUuid ] } )
        console.log( "current pages", ( await db ).exec( "SELECT * FROM pages;", { returnValue: "resultRows", rowMode: "object" } ) )
    }
} )
