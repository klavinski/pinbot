import { SQLValue } from "sqlite-wasm-http/sqlite3.js"
import { z } from "zod"

export const pinParser = z.object( {
    embedding: z.instanceof( Uint8Array ),
    isPinned: z.coerce.boolean(),
    screenshot: z.string(),
    text: z.string(),
    timestamp: z.string(),
    url: z.string()
} )

export const asPin = ( value: Record<string, SQLValue> ) => {
    const parsedData = pinParser.parse( value )
    return { ...parsedData, embedding: new Float32Array( parsedData.embedding.buffer ) }
}

export type Pin = ReturnType<typeof toPin>
