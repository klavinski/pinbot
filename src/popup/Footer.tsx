import { Lottie } from "@crello/react-lottie"
import search from "react-useanimations/lib/searchToX"
import mail from "react-useanimations/lib/mail"
import { Icon } from "./Icon.tsx"
import styles from "./Footer.module.css"
import { Dispatch, SetStateAction, useState } from "react"
import { Editor } from "./Editor.tsx"

export const Footer = ( { pins, onSubmit }: { pins: unknown[], onSubmit: ( content: { text: string, tags: string[] } ) => void } ) => {
    const [ content, setContent ] = useState( { text: "", tags: [] as string[] } )
    const [ isOpen, setIsOpen ] = useState( false )
    return <div className={ styles.container }>
        <div className={ styles.shadow }/>
        <div className={ styles.glow }/>
        <div className={ styles.border }/>
        <div className={ styles.content }>
            <Icon
                of={ <Lottie config={ { animationData: mail.animationData } } direction={ isOpen ? 1 : - 1 }/> }
                onMouseEnter={ () => setIsOpen( true ) }
                onMouseLeave={ () => setIsOpen( false ) }
            />
            <Editor
                placeholder="Search your pins (# for tags)"
                onUpdate={ _ => {
                    const body = new DOMParser().parseFromString( _, "text/html" ).body
                    setContent( { text: body.textContent ?? "", tags: [ ...body.querySelectorAll( "tag" ) ].map( _ => _.textContent ?? "" ).filter( _ => _ ) } ) }
                }
                onEnter={ () => onSubmit( content ) }
            />
            <div style={ { transform: `translateX( ${ content.text === "" && pins.length === 0 ? 32 : 0 }px )`, transition: "all 0.2s ease-in-out" } }>
                <Icon
                    of={ <Lottie config={ { animationData: search.animationData } } direction={ pins.length === 0 ? - 1 : 1 }/> }
                    onClick={ () => onSubmit( content ) }
                />
            </div>
        </div>
    </div>
}
