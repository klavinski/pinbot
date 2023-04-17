import { pipeline } from "@xenova/transformers"

const pipe = pipeline( "embeddings", "sentence-transformers/all-MiniLM-L6-v2" )
const embed = async ( text: string ) => ( await ( await pipe )( text ) ).data

window.addEventListener( "message", async ( { data } ) => {
    console.log( data, "in sandbox" )
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
