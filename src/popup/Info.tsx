import { useState } from "react"
import styles from "./Info.module.css"
import { Icon } from "./Icon"
import { Animation } from "./Animation"
import { createPortal } from "react-dom"
import { version } from "../../package.json"
import { Link } from "./Link"
import IconTablerMessages from "~icons/tabler/messages"
import IconTablerMessageDots from "~icons/tabler/message-dots"
import IconLucideBot from "~icons/lucide/bot"
import { useTooltip } from "./useTooltip"

export const Info = () => {
    const [ isOpen, setIsOpen ] = useState( false )
    const [ isHovering, setIsHovering ] = useState( false )
    const { referenceProps, tooltip } = useTooltip( "Info" )
    return <>
        <div className={ styles.button }
            onClick={ () => setIsOpen( ! isOpen ) }
            onMouseEnter={ () => setIsHovering( true ) }
            onMouseLeave={ () => setIsHovering( false ) }
            { ...referenceProps }
        >
            <Icon of={ <Animation of="info" direction={ isHovering ? 1 : - 1 }/> }/>
        </div>
        { createPortal(
            <div className={ styles.container } style={ { backdropFilter: `blur( ${ isOpen ? 8 : 0 }px )`, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" } } onClick={ () => setIsOpen( false ) }>
                <div className={ styles.panel } onClick={ e => e.stopPropagation() }>
                    <div>Pinbot v{ version }</div>
                    <div>By Kamil Szczerba</div>
                    &nbsp;
                    <Link href="https://getpinbot.com" prefix={ <IconLucideBot/> }>Visit the website</Link>
                    <Link href="https://tally.so/r/3NravQ" prefix={ <IconTablerMessageDots/> }>Leave feedback</Link>
                    <Link href="https://discord.gg/NetMteXfjf" prefix={ <IconTablerMessages/> }>Meet the community</Link>
                </div>
            </div>,
            document.body
        ) }
        { tooltip }
    </>
}
