import { Lottie } from "@crello/react-lottie"
import search from "react-useanimations/lib/searchToX"
import { Icon } from "./Icon.tsx"
import styles from "./Footer.module.css"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { Editor } from "./Editor.tsx"
import { parseHtml } from "../utils.ts"

export const Footer = ( { query, setQuery }: { query: { text: string, tags: string[] } | null, setQuery: Dispatch<SetStateAction<{ text: string, tags: string[] } | null>> } ) => {
    const content = useRef( { text: "", tags: [] as string[] } )
    return <div className={ styles.container }>
        <div className={ styles.shadow }/>
        <div className={ styles.glow }/>
        <div className={ styles.border }/>
        <div className={ styles.content }>
            <Editor
                placeholder="Search your pins (# for tags)"
                onUpdate={ _ => content.current = parseHtml( _ ) }
                onEnter={ () => setQuery( query ? null : content.current ) }
            />
            <div style={ { transform: `translateX( ${ query || content.current.text !== "" ? 0 : 32 }px )`, transition: "all 0.2s ease-in-out" } }>
                <Icon
                    of={ <Lottie config={ { animationData: search.animationData } } direction={ query ? 1 : - 1 }/> }
                    onClick={ () => setQuery( query ? null : content.current ) }
                />
            </div>
        </div>
    </div>
}
