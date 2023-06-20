import styles from "./Icon.module.css"
import IconTablerTag from "~icons/tabler/tag"
import IconTablerHash from "~icons/tabler/hash"
import IconTablerPencil from "~icons/tabler/pencil"
import IconTablerFaceId from "~icons/tabler/face-id"
import IconUilNewspaper from "~icons/uil/newspaper"
import IconTablerLanguage from "~icons/tabler/language"
import IconTablerBook2 from "~icons/tabler/book-2"
import IconUilUsersAlt from "~icons/uil/users-alt"


import { embed } from "../workers/transformers.ts"
import { cosineSimilarity } from "../utils.ts"
import { ComponentPropsWithoutRef, ReactNode, useEffect, useState } from "react"
import { IconHeartHand } from "untitled-ui-icons"

const icons = {
    "book": IconTablerBook2,
    "charity": IconHeartHand,
    "language": IconTablerLanguage,
    "news": IconUilNewspaper,
    "pencil": IconTablerPencil,
    "people": IconUilUsersAlt,
    "tag": IconTablerTag,
    "frame": IconTablerFaceId
} as const

const embeddings = Promise.all( Object.entries( icons ).map( async ( [ name ] ) => ( { name: name as keyof typeof icons, embedding: await embed( name ) } ) ) )

const findClosest = async ( query: string ) => {
    const queryEmbedding = await embed( query )
    const results = ( await embeddings ).map( ( { name, embedding } ) => ( { name, similarity: cosineSimilarity( embedding, queryEmbedding ) } ) )
    const name = results.reduce( ( best, current ) => best.similarity > current.similarity ? best : current ).name
    return icons[ name ]
}

export const Icon = ( { className, of, ...props }: { of: ReactNode } & ComponentPropsWithoutRef<"div"> ) => {
    const [ element, setElement ] = useState( <IconTablerHash/> )
    useEffect( () => {
        if ( typeof of === "string" )
            findClosest( of ).then( _ => setElement( of === "" ? <IconTablerHash/> : <_/> ) )
        else
            setElement( <>{ of }</> )
    }, [ of ] )
    return <div className={ [ styles.container, props.onClick ? styles.clickable : undefined, className ].filter( _ => _ ).join( " " ) } { ...props }>
        <div className={ styles.frame }>
            { element }
        </div>
    </div>
}
