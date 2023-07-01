import { useState } from "react"
import styles from "./PinComponent.module.css"
import { Icon } from "./Icon.tsx"
import { Editor } from "./Editor/Editor.tsx"
import { useApi } from "./api.tsx"
import { SetStateAction } from "react"
import { Dispatch } from "react"
import { Pin } from "../types.ts"
import { Animation } from "./Animation.tsx"
import { useTooltip } from "./useTooltip.tsx"
import { Link } from "./Link.tsx"
import IconTablerPhoto from "~icons/tabler/photo"
import IconTablerPhotoPlus from "~icons/tabler/photo-plus"
import IconTablerPhotoMinus from "~icons/tabler/photo-minus"
import IconTablerPhotoCancel from "~icons/tabler/photo-cancel"

export const PinComponent = ( { onDelete, pin: init, setVisiblePictures, visiblePictures }: { onDelete: () => void, pin: Pin, setVisiblePictures: Dispatch<SetStateAction<boolean>>, visiblePictures: boolean } ) => {
    const api = useApi()
    const [ pin, setPin ] = useState( init as Pin )
    const favicon = new URL( chrome.runtime.getURL( "/_favicon/" ) )
    favicon.searchParams.set( "pageUrl", pin?.url ?? "" )
    favicon.searchParams.set( "size", "32" )
    const [ removing, setRemoving ] = useState( true )
    const [ hoveringHiding, setHoveringHiding ] = useState( false )
    const { referenceProps: bookmarkRefProps, tooltip: bookmarkTooltip } = useTooltip( { content: pin.isPinned ? "Convert to draft" : "Save as pin", pointerEvents: "none" } )
    const { referenceProps: removeRefProps, tooltip: removeTooltip } = useTooltip( { content: "Delete", pointerEvents: "none" } )
    const { referenceProps: hideRefProps, tooltip: hideTooltip } = useTooltip( { content: `${ visiblePictures ? "Hide" : "Show" } pictures`, pointerEvents: "none" } )
    return pin ? <div className={ styles.container }>
        <div className={ styles.header }>
            <Icon of={ <img src={ favicon.toString() }/> } className={ styles.favicon }/>
            <div className={ styles.description }>
                <Link href={ pin.url }>{ pin.url }</Link>
                <Editor content={ pin.text }
                    onUpdate={ text => api.updatePin( { ...pin, text } ) }
                />
            </div>
            <div className={ styles.actions }>
                <div onClick={ async () => setPin( await api.togglePin( pin ) ) } { ...bookmarkRefProps }>
                    { Array.from( { length: 4 } ).map( ( _, i, { length } ) => <Icon of={
                        <Animation of="bookmark" direction={ pin.isPinned ? 1 : - 1 }/>
                    } style={ { position: i === length - 1 ? undefined : "absolute", transform: `translate( ${ 0.2 * Math.cos( i / length * Math.PI * 2 ) }px, ${ 0.2 * Math.sin( i / length * Math.PI * 2 ) }px )` } }/> ) }
                    { bookmarkTooltip }
                </div>
                <div onClick={ async () => { await api.removePin( pin ); onDelete() } }
                    onMouseEnter={ () => setRemoving( false ) }
                    onMouseLeave={ () => setRemoving( true ) }
                    { ...removeRefProps }>
                    <Icon of={ <Animation of="remove" direction={ removing ? - 1 : 1 }/> }/>
                    { removeTooltip }
                </div>
                <div onClick={ () => setVisiblePictures( ! visiblePictures ) } { ...hideRefProps }
                    onMouseEnter={ () => setHoveringHiding( true ) }
                    onMouseLeave={ () => setHoveringHiding( false ) }
                >
                    { <Icon of={ <IconTablerPhoto/> } style={ { opacity: visiblePictures && ! hoveringHiding ? 1 : 0 } }/> }
                    { <Icon of={ <IconTablerPhotoMinus/> } style={ { opacity: visiblePictures && hoveringHiding ? 1 : 0 } }/> }
                    { <Icon of={ <IconTablerPhotoPlus/> } style={ { opacity: ! visiblePictures && hoveringHiding ? 1 : 0 } }/> }
                    { <Icon of={ <IconTablerPhotoCancel/> } style={ { opacity: ! visiblePictures && ! hoveringHiding ? 1 : 0 } }/> }
                    { hideTooltip }
                </div>
            </div>
        </div>
        { visiblePictures && <img src={ pin?.screenshot } className={ styles.screenshot }/> }
    </div> : <></>
}
