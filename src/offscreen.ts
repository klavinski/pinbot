import { initBackend } from "absurd-sql/dist/indexeddb-main-thread"
import workerUrl from "./worker.ts?url"

function init() {
    let worker = new Worker( new URL( workerUrl, import.meta.url ) )
    // This is only required because Safari doesn't support nested
    // workers. This installs a handler that will proxy creating web
    // workers through the main thread
    initBackend( worker )
}

init()
