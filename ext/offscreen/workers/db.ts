import initSyncSQLite, { DB, SQLBindable } from "sqlite-wasm-http/sqlite3.js"
import { exampleImage } from "./exampleImage.ts"

const init = async () => {
    const sqlite = await initSyncSQLite()
    if ( "OpfsDb" in sqlite.oo1 && typeof sqlite.oo1.OpfsDb === "function" ) {
        const db = new ( sqlite.oo1.OpfsDb as new ( filename: string, mode: string ) => DB )( "db2", "c" )
        // const db = new sqlite.oo1.DB()
        db.exec( "PRAGMA journal_mode = WAL; PRAGMA synchronous = normal; PRAGMA temp_store = memory; PRAGMA mmap_size = 30000000000;" )
        const newInstallation = db.exec( "SELECT name FROM sqlite_master WHERE type='table' AND name='pins';", { returnValue: "resultRows", rowMode: "object" } ).length === 0
        if ( newInstallation ) {
            db.exec( `
                CREATE TABLE pins (
                    embedding BLOB NOT NULL,
                    isPinned INTEGER NOT NULL,
                    screenshot TEXT NOT NULL,
                    text TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    url TEXT NOT NULL,
                    PRIMARY KEY ( timestamp, url )
                );
                CREATE TABLE pages (
                    embedding BLOB NOT NULL,
                    text TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    url TEXT NOT NULL,
                    PRIMARY KEY ( text, timestamp, url )
                );
                INSERT INTO pins ( embedding, isPinned, text, timestamp, screenshot, url ) VALUES ( $1, 0, '<p>Welcome!</p>
                <p>Pinbot converts a page into an editable draft, like the text you are reading. Try editing it!</p>
                <p></p>
                <p>It will also pick tags (like <tag>Savings</tag> or <tag>Travel</tag>) among those existing.</p>
                <p></p>
                <p>💡You can use tags to keep track of tasks <tag>To do</tag>, relevant <tag>People</tag>, etc.</p>
                <p></p>
                <p>Save the draft as a pin by clicking on the bookmark icon. It will make it accessible as a search result.</p>
                <p></p>
                <p>Finally, you can delete this example by clicking on the trash icon.</p>
                ', datetime( 'now' ), '${ exampleImage }', 'https://example.com' );`, { bind: [ new Float32Array( Array.from( { length: 384 } ).map( _ => 1 ) ).buffer ] } )
        }
        return db
    } else
        throw new Error( "No OPFS." )
}
const db = init()

export const sql = async ( query: TemplateStringsArray | string[], ...bind: SQLBindable[] ) => ( await db ).exec( query.map( ( string, i ) => `${ i ? `$${ i }` : "" }${ string }` ).join( "" ), { bind, returnValue: "resultRows", rowMode: "object" } )
