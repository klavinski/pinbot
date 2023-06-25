import { useState } from "react"
import { Lottie } from "@crello/react-lottie"
import remove from "react-useanimations/lib/trash"
import hide from "./visibility-V3.json"
import bookmark from "./bookmark.json"
import styles from "./PinComponent.module.css"
import { Icon } from "./Icon.tsx"
import { Editor } from "./Editor.tsx"
import { useApi } from "./api.tsx"
import { useEffect } from "react"
import { SetStateAction } from "react"
import { Dispatch } from "react"
import { Pin } from "../types.ts"

export const PinComponent = ( { pin: init, setVisiblePictures, visiblePictures }: { pin: Pin, setVisiblePictures: Dispatch<SetStateAction<boolean>>, visiblePictures: boolean } ) => {
    const api = useApi()
    const [ pin, setPin ] = useState( init as Pin | null )
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
                    onUpdate={ text => api.sql`UPDATE pins SET text = ${ text }  WHERE url = ${ pin.url };` }
                />
            </div>
            <div className={ styles.actions }>
                <div onClick={ async () => setPin( await api.togglePin( pin ) ) }
                    style={ { filter: `brightness( ${ pin.isPinned } )` } }>
                    { Array.from( { length: 4 } ).map( ( _, i, { length } ) => <Icon of={ <Lottie
                        config={ { animationData: bookmark, initialSegment: [ 0, 62 ] } }
                        direction={ pin.isPinned ? 1 : - 1 }
                    /> } style={ { position: i === length - 1 ? undefined : "absolute", transform: `translate( ${ 0.2 * Math.cos( i / length * Math.PI * 2 ) }px, ${ 0.2 * Math.sin( i / length * Math.PI * 2 ) }px )` } }/> ) }
                </div>
                <div onClick={ async () => setPin( await api.removePin( pin ) ) }
                    onMouseEnter={ () => setRemoving( false ) }
                    onMouseLeave={ () => setRemoving( true ) }>
                    <Icon of={ <Lottie
                        config={ { animationData: remove.animationData } }
                        direction={ removing ? - 1 : 1 }
                    /> }/>
                </div>
                <div onClick={ () => setVisiblePictures( ! visiblePictures ) }>
                    <Icon of={ <Lottie
                        config={ { animationData: hide } }
                        direction={ visiblePictures ? - 1 : 1 }
                    /> }/>
                </div>
            </div>
        </div>
        { visiblePictures && <img src={ pin?.screenshot } className={ styles.screenshot }/> }
    </div> : <div>Loading...</div>
}
