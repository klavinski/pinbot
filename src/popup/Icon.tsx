import styles from "./Icon.module.css"
import IconTag from "~icons/tabler/tag"
import IconHash from "~icons/tabler/hash"
import IconPencil from "~icons/tabler/pencil"
import IconFrame from "~icons/tabler/face-id"


import { embed } from "../transformers.ts"
import { cosineSimilarity } from "../utils.ts"
import { ComponentPropsWithoutRef, ReactNode, useEffect, useState } from "react"

const icons = {
    "pencil": IconPencil,
    "tag": IconTag,
    "frame": IconFrame
} as const

const embeddings = Promise.all( Object.entries( icons ).map( async ( [ name ] ) => ( { name: name as keyof typeof icons, embedding: await embed( name ) } ) ) )

const findClosest = async ( query: string ) => {
    const queryEmbedding = await embed( query )
    const results = ( await embeddings ).map( ( { name, embedding } ) => ( { name, similarity: cosineSimilarity( embedding, queryEmbedding ) } ) )
    const name = results.reduce( ( best, current ) => best.similarity > current.similarity ? best : current ).name
    return icons[ name ]
}

export const Icon = ( { className, of, ...props }: { of: ReactNode } & ComponentPropsWithoutRef<"div"> ) => {
    const [ element, setElement ] = useState( <IconHash/> )
    useEffect( () => {
        if ( typeof of === "string" )
            findClosest( of ).then( _ => setElement( of === "" ? <IconHash/> : <_/> ) )
        else
            setElement( <>{ of }</> )
    }, [ of ] )
    return <div className={ [ styles.container, props.onClick ? styles.clickable : undefined, className ].filter( _ => _ ).join( " " ) } { ...props }>
        <div className={ styles.frame }>
            { element }
        </div>
    </div>
}
