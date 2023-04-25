import { createPortal } from "react-dom"
import styles from "./Alerts.module.css"
import { useState } from "react"
import { IconMoodSmile } from "@tabler/icons-react"

export const AccountButton = () => {
    const [ isOpen, setIsOpen ] = useState( false )
    return <div className={ [ styles.button, "clickableIcon" ].join( " " ) } onClick={ () => setIsOpen( ! isOpen ) }>
        <IconMoodSmile/>
        { createPortal( <div
            className="background"
            style={ isOpen ? undefined : { opacity: 0, pointerEvents: "none" } }
            onClick={ () => setIsOpen( false ) }>
            <Account/>
        </div>
        , document.body ) }
    </div>
}

export const Account = () => <div onClick={ e => e.stopPropagation() }>
    The current extension only keeps your history for one month.<br/>
    Accounts keep all your history and synchronize it across your<br/>
    devices, while maintaining your privacy.<br/>
    <br/>
    Upcoming in the next version!
</div>
