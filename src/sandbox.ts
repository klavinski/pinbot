import { pipeline } from "@xenova/transformers"
import { z } from "zod"

const embeddingsPipe = pipeline( "embeddings", "sentence-transformers/all-MiniLM-L6-v2" )
const embed = async ( text: string ) => ( await ( await embeddingsPipe )( text ) ).data

window.addEventListener( "message", async ( { data } ) => {
    console.log( data, "in sandbox" )
    try {
        const { message: { query }, } = z.object( { message: z.object( { query: z.string() } ) } ).parse( data )
        parent.postMessage( {
            ...data,
            embeddings: await embed( query )
        }, "*" )
    } catch ( e ) {
        console.error( e, "in sandbox" )
    }
} )

parent.postMessage( "sandbox ready", "*" )
