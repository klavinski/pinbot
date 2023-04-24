import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"

export const split = ( text: string ) =>
    winkNLP( model ).readDoc( text ).sentences().out()
        .flatMap( _ => _.split( "\n" ) )
        .filter( _ => _ !== "" )

export const maximumIndex = <T extends { [key in K]: number }, K extends keyof T>( array: T[], key: K ) =>
    array.reduce<{ bestIndex: number, bestScore: number }>( ( { bestIndex, bestScore }, item, index ) => {
        const score = item[ key ]
        return score > bestScore ? { bestIndex: index, bestScore: score } : { bestIndex, bestScore }
    }, { bestIndex: - 1, bestScore: - Infinity } ).bestIndex
