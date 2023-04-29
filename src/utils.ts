import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"
const { readDoc } = winkNLP( model )

export const cosineSimilarity = ( a: Float32Array, b: Float32Array ) => {
    let dot = 0
    let normA = 0
    let normB = 0
    for ( let i = 0; i < a.length; i ++ ) {
        dot += a[ i ] * b[ i ]
        normA += a[ i ] ** 2
        normB += b[ i ] ** 2
    }
    return dot / ( Math.sqrt( normA * normB ) )
}

export const mixEmbeddings = ( title: Float32Array, before: Float32Array, sentence: Float32Array, after: Float32Array ) => {
    const result = new Float32Array( title.length )
    result.forEach( ( _, i ) => result[ i ] = 0.1 * title[ i ] + 0.1 * before[ i ] + 0.7 * sentence[ i ] + 0.1 * after[ i ] )
    return result
}

export const tokenize = ( text: string ) => text
    .normalize( "NFD" )
    .replace( /\p{Diacritic}/gu, "" )
    .toLowerCase()
    .replace( /(.)('ll|'re|'ve|n't|'s|'m|'d)\b/ig, "$1 $2" )
    .replace( /([^\w.'\-/+<>,&])/g, " $1 " )
    .replace( /(,\s)/g, " $1" )
    .replace( /('\s)/g, " $1" )
    .replace( /\. *(\n|$)/g, " . " )
    .split( /\s+/ )
    .map( model.addons.stem as ( word: string ) => string )
    .filter( _ => _ !== "" )

export const split = ( text: string ) =>
    readDoc( text ).sentences().out()
        .flatMap( _ => _.replace( /\s+/, " " ).split( "\n" ) )
        .map( _ => _.trim() )
        .filter( _ => _ !== "" )

export const maximumIndex = <T extends { [key in K]: number }, K extends keyof T>( array: T[], key: K ) =>
    array.reduce<{ bestIndex: number, bestScore: number }>( ( { bestIndex, bestScore }, item, index ) => {
        const score = item[ key ]
        return score > bestScore ? { bestIndex: index, bestScore: score } : { bestIndex, bestScore }
    }, { bestIndex: - 1, bestScore: - Infinity } ).bestIndex
