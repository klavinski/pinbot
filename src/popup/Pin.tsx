import { useState } from "react"
import { Lottie } from "@crello/react-lottie"
import remove from "react-useanimations/lib/trash"
import hide from "./visibility-V3.json"
import IconPin from "~icons/tabler/pin"
import IconPinned from "~icons/tabler/pinned"
import styles from "./Pin.module.css"
import { Icon } from "./Icon.tsx"
import { Editor } from "./Editor.tsx"
import { useApi } from "./context.tsx"
import { useEffect } from "react"
import { SetStateAction } from "react"
import { Dispatch } from "react"

export const Pin = ( { setVisiblePictures, url, visiblePictures }: { setVisiblePictures: Dispatch<SetStateAction<boolean>>, url: string, visiblePictures: boolean } ) => {
    const api = useApi()
    const [ pin, setPin ] = useState( null as { text: string, screenshot: string, url: string } | null )
    const [ hidden, setHidden ] = useState( false )
    useEffect( () => {
        api.sql`SELECT * FROM pins WHERE url = ${ url }`.then( ( [ pin ] ) => setPin( pin ) )
    }, [ url ] )
    const favicon = new URL( chrome.runtime.getURL( "/_favicon/" ) )
    favicon.searchParams.set( "pageUrl", pin?.url ?? "" )
    favicon.searchParams.set( "size", "32" )
    const [ removing, setRemoving ] = useState( true )
    return pin ? <div className={ styles.container }>
        <div className={ styles.header }>
            <Icon of={ <img src={ favicon.toString() }/> } className={ styles.favicon }/>
            <Editor content={ pin.text }
                onUpdate={ text => api.sql`UPDATE pins SET text = ${ text }  WHERE url = ${ url };` }/>
            <div className={ styles.actions }>
                <div onMouseEnter={ () => setRemoving( false ) }
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
