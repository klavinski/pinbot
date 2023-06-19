import initSyncSQLite, { DB } from "sqlite-wasm-http/sqlite3.js"
import { z } from "zod"
import { zSqlValue } from "./types.ts"

const init = async () => {
    const sqlite = await initSyncSQLite()
    if ( "OpfsDb" in sqlite.oo1 && typeof sqlite.oo1.OpfsDb === "function" ) {
        // const db = new ( sqlite.oo1.OpfsDb as new ( filename: string, mode: string ) => DB )( "db1", "c" )
        const db = new sqlite.oo1.DB()
        db.exec( "PRAGMA journal_mode = WAL; PRAGMA synchronous = normal; PRAGMA temp_store = memory; PRAGMA mmap_size = 30000000000;" )
        return db
    } else
        throw new Error( "No OPFS." )
}
const db = init()

self.addEventListener( "message", async ( { data } ) => {
    const parsing = z.object( { query: z.string(), bind: z.array( zSqlValue ), uuid: z.string() } ).safeParse( data )
    if ( parsing.success )
        self.postMessage( { ...parsing.data, results: ( await db ).exec( parsing.data.query, { bind: parsing.data.bind, returnValue: "resultRows", rowMode: "object" } ) } )
    else
        console.log( "received in worker:", data )
} )
