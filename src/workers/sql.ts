import initSyncSQLite, { DB, SQLBindable } from "sqlite-wasm-http/sqlite3.js"

const init = async () => {
    const sqlite = await initSyncSQLite()
    if ( "OpfsDb" in sqlite.oo1 && typeof sqlite.oo1.OpfsDb === "function" ) {
        // const db = new ( sqlite.oo1.OpfsDb as new ( filename: string, mode: string ) => DB )( "db1", "c" )
        const db = new sqlite.oo1.DB()
        db.exec( "PRAGMA journal_mode = WAL; PRAGMA synchronous = normal; PRAGMA temp_store = memory; PRAGMA mmap_size = 30000000000;" )
        db.exec( `CREATE TABLE IF NOT EXISTS pins ( uuid TEXT PRIMARY KEY, text TEXT NOT NULL, screenshot TEXT NOT NULL, url TEXT NOT NULL );
        INSERT INTO pins ( uuid, text, screenshot, url ) VALUES ( 'uuid', '<p>Automatically generated title</p><p>and summary with <tag>tags</tag>.</p><p>And a screenshot below</p>', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADs', 'https://example.com' );` )
        return db
    } else
        throw new Error( "No OPFS." )
}
const db = init()

export const sql = async ( query: TemplateStringsArray, ...bind: SQLBindable[] ) => ( await db ).exec( query.map( ( string, i ) => i === 0 ? string : `$${ i }${ string }` ).join( "" ), { bind, returnValue: "resultRows", rowMode: "object" } )
