import { pipeline } from "@xenova/transformers"

const embeddingsPipe = pipeline( "embeddings", "sentence-transformers/all-MiniLM-L6-v2" )
const embed = async ( text: string ) => ( await ( await embeddingsPipe )( text ) ).data

window.addEventListener( "message", async ( { data } ) => {
    if ( typeof data === "string" ) {
        parent.postMessage( {
            text: data,
            embeddings: await embed( data )
        }, "*" )
    } else {
        console.error( data, "in sandbox" )
    }
} )

parent.postMessage( "sandbox ready", "*" )
