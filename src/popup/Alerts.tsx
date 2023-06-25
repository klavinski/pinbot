import { createPortal } from "react-dom"
import styles from "./Alerts.module.css"
import { IconBell03 } from "untitled-ui-icons/icons/IconBell03"
import { useState } from "react"

export const AlertsButton = () => {
    const [ isOpen, setIsOpen ] = useState( false )
    return <div className={ [ styles.button, "clickableIcon" ].join( " " ) } onClick={ () => setIsOpen( ! isOpen ) }>
        <IconBell03/>
        { createPortal( <div
            className="background"
            style={ isOpen ? undefined : { opacity: 0, pointerEvents: "none" } }
            onClick={ () => setIsOpen( false ) }>
            <Alerts/>
        </div>
        , document.body ) }
    </div>
}

export const Alerts = () => <div onClick={ e => e.stopPropagation() }>
    Alerts watch pages and notify you when a change<br/>
    matches one of your natural language queries.<br/>
    <br/>
    Upcoming in a future version!
</div>
