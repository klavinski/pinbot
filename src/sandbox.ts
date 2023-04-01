import { pipeline } from "@xenova/transformers"
import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"
const { readDoc } = winkNLP( model )

const embeddingsPipe = pipeline( "embeddings", "sentence-transformers/all-MiniLM-L6-v2" )
const embed = async ( ...texts: string[] ) => ( await ( await embeddingsPipe )( ...texts ) ).data

window.addEventListener( "message", async ( { data } ) => {
    console.log( "in sandbox", data )
    if ( typeof data === "object" && data.query && data.context ) {
        console.time( "Embedding query" )
        const queryEmbeddings = await embed( data.query )
        console.timeEnd( "Embedding query" )
        console.time( "Slicing context" )
        const slices = readDoc( data.context ).sentences().out()
        console.timeEnd( "Slicing context" )
        const slicesWithPreviousAndNext = Array.from( { length: slices.length - 2 } ).map( ( _, index ) => `${ slices[ index ] }${ slices[ index + 1 ] }${ slices[ index + 2 ] }` )
        console.time( "Embedding slices" )
        // const result = ( await Promise.all( slicesWithPreviousAndNext.map( async ( slice, i ) => {
        //     const embeddings = await embed( slice )
        //     console.log( "Done", i, slicesWithPreviousAndNext.length, embeddings )
        //     const similarity = embeddings.reduce( ( acc, val, index ) => acc + val * queryEmbeddings[ index ], 0 )
        //     return { slice, similarity }
        // } ) ) )
        console.log( await embed( ...slicesWithPreviousAndNext ) )
        const result = ( await embed( ...slicesWithPreviousAndNext ) ).map( ( embeddings, i ) => ( { slice: slicesWithPreviousAndNext[ i ], similarity: embeddings.reduce( ( acc, val, index ) => acc + val * queryEmbeddings[ index ], 0 ) } ) )
        console.timeEnd( "Embedding slices" )
        console.time( "Sorting" )
        result.sort( ( a, b ) => b.similarity - a.similarity )
        console.timeEnd( "Sorting" )
        parent.postMessage( { result }, "*" )
    } else
        console.log( "not a question" )

} )

parent.postMessage( "ready", "*" )
