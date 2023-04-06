import initSyncSQLite, { DB } from "sqlite-wasm-http/sqlite3.js"

const run = async () => {
    const sqlite = await initSyncSQLite()
    if ( "OpfsDb" in sqlite.oo1 && typeof sqlite.oo1.OpfsDb === "function" ) {
        sqlite.oo1.DB
        const db = new ( sqlite.oo1.OpfsDb as new ( filename: string, mode: string ) => DB )( "db", "c" )
        db.exec( "CREATE TABLE IF NOT EXISTS pages (uuid TEXT, url TEXT, date INTEGER, body TEXT, embeddings TEXT);" )
        db.exec( "CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING FTS5(uuid, body);" )
        // db.exec( "INSERT INTO posts(title,body) VALUES('Learn SQlite FTS5','This tutorial teaches you how to perform full-text search in SQLite using FTS5'), ('Advanced SQlite Full-text Search','Show you some advanced techniques in SQLite full-text searching'), ('SQLite Tutorial','Help you learn SQLite quickly and effectively')" )
        console.log( db.exec( "SELECT * FROM pages;", { returnValue: "resultRows", rowMode: "object" } ) )
        console.log( db )
    } else
        console.log( "No OPFS." )
}

setTimeout( run, 3000 )
