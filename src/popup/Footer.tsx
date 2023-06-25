import { Lottie } from "@crello/react-lottie"
import search from "react-useanimations/lib/searchToX"
import mail from "react-useanimations/lib/mail"
import { Icon } from "./Icon.tsx"
import styles from "./Footer.module.css"
import { Dispatch, SetStateAction, useState } from "react"
import { Editor } from "./Editor.tsx"

export const Footer = ( { query, setQuery }: { query: { text: string, tags: string[] }|null, setQuery: Dispatch<SetStateAction<{ text: string, tags: string[] } | null>> } ) => {
    const [ content, setContent ] = useState( { text: "", tags: [] as string[] } )
    return <div className={ styles.container }>
        <div className={ styles.shadow }/>
        <div className={ styles.glow }/>
        <div className={ styles.border }/>
        <div className={ styles.content }>
            <Editor
                placeholder="Search your pins (# for tags)"
                onUpdate={ _ => {
                    const body = new DOMParser().parseFromString( _, "text/html" ).body
                    setContent( { text: body.textContent ?? "", tags: [ ...body.querySelectorAll( "tag" ) ].map( _ => _.textContent ?? "" ).filter( _ => _ ) } ) }
                }
                onEnter={ () => setQuery( content ) }
            />
            <div style={ { transform: `translateX( ${ query || content.text !== "" ? 0 : 32 }px )`, transition: "all 0.2s ease-in-out" } }>
                <Icon
                    of={ <Lottie config={ { animationData: search.animationData } } direction={ query ? 1 : - 1 }/> }
                    onClick={ () => setQuery( query ? null : content ) }
                />
            </div>
        </div>
    </div>
}
