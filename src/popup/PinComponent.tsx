import { useState } from "react"
import styles from "./PinComponent.module.css"
import { Icon } from "./Icon.tsx"
import { Editor } from "./Editor.tsx"
import { useApi } from "./api.tsx"
import { SetStateAction } from "react"
import { Dispatch } from "react"
import { Pin } from "../types.ts"
import { Animation } from "./Animation.tsx"

export const PinComponent = ( { onDelete, pin: init, setVisiblePictures, visiblePictures }: { onDelete: () => void, pin: Pin, setVisiblePictures: Dispatch<SetStateAction<boolean>>, visiblePictures: boolean } ) => {
    const api = useApi()
    const [ pin, setPin ] = useState( init as Pin )
    const favicon = new URL( chrome.runtime.getURL( "/_favicon/" ) )
    favicon.searchParams.set( "pageUrl", pin?.url ?? "" )
    favicon.searchParams.set( "size", "32" )
    const [ removing, setRemoving ] = useState( true )
    return pin ? <div className={ styles.container }>
        <div className={ styles.header }>
            <Icon of={ <img src={ favicon.toString() }/> } className={ styles.favicon }/>
            <div className={ styles.description }>
                <a className={ styles.link } href={ pin.url }>{ pin.url }</a>
                <Editor content={ pin.text }
                    onUpdate={ text => api.updatePin( { ...pin, text } ) }
                />
            </div>
            <div className={ styles.actions }>
                <div onClick={ async () => setPin( await api.togglePin( pin ) ) }>
                    { Array.from( { length: 4 } ).map( ( _, i, { length } ) => <Icon of={
                        <Animation of="bookmark" direction={ pin.isPinned ? 1 : - 1 }/>
                    } style={ { position: i === length - 1 ? undefined : "absolute", transform: `translate( ${ 0.2 * Math.cos( i / length * Math.PI * 2 ) }px, ${ 0.2 * Math.sin( i / length * Math.PI * 2 ) }px )` } }/> ) }
                </div>
                <div onClick={ async () => { await api.removePin( pin ); onDelete() } }
                    onMouseEnter={ () => setRemoving( false ) }
                    onMouseLeave={ () => setRemoving( true ) }>
                    <Icon of={ <Animation of="remove" direction={ removing ? - 1 : 1 }/> }/>
                </div>
                <div onClick={ () => setVisiblePictures( ! visiblePictures ) }>
                    <Icon of={ <Animation of="hide" direction={ visiblePictures ? - 1 : 1 }/> }/>
                </div>
            </div>
        </div>
        { visiblePictures && <img src={ pin?.screenshot } className={ styles.screenshot }/> }
    </div> : <></>
}
