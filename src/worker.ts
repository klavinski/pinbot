import sqlite3InitModule from "sqlite-wasm-http/sqlite3.js"

const run = async () => {
    const sqlite = await sqlite3InitModule()
    if ( sqlite.opfs ) {
        const db = new sqlite.oo1.OpfsDb( "db", "c" )
        await db.exec( "CREATE TABLE IF NOT EXISTS pages(uuid TEXT, url TEXT, date INTEGER, body TEXT, embeddings TEXT);" )
        await db.exec( "CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING FTS5(uuid, body);" )
        // await db.exec( "INSERT INTO posts(title,body) VALUES('Learn SQlite FTS5','This tutorial teaches you how to perform full-text search in SQLite using FTS5'), ('Advanced SQlite Full-text Search','Show you some advanced techniques in SQLite full-text searching'), ('SQLite Tutorial','Help you learn SQLite quickly and effectively')" )
        console.log( await db.exec( "SELECT * FROM posts WHERE posts MATCH 'text' ORDER BY rank;", { returnValue: "resultRows", rowMode: "object" } ) )
        console.log( db )
    } else
        console.log( "No OPFS." )
}

setTimeout( run, 3000 )
