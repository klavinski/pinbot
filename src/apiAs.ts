import { z } from "zod"
import { makeApi } from "./makeApi.ts"

export const apiAs = makeApi( {} )
    .add( "embed", {
        check: z.string(), from: "offscreen",
        handler: async text => {
            if ( "pipe" in globalThis )
                return ( await ( await globalThis.pipe )( text ) ).data
            else throw new Error( "No embeddings pipe" )
        },
        to: "sandbox"
    } ).build
