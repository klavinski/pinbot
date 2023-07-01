import { ReactNode, useState } from "react"
import styles from "./Panel.module.css"
import { Icon } from "../Icon"
import { createPortal } from "react-dom"
import { useTooltip } from "../useTooltip"

export const Panel = ( { children, icon: iconMaker, tooltip: tooltipText }: { children: ReactNode, icon: ( isHovered: boolean ) => ReactNode, tooltip: ReactNode } ) => {
    const [ isOpen, setIsOpen ] = useState( false )
    const [ isHovering, setIsHovering ] = useState( false )
    const { referenceProps, tooltip } = useTooltip( tooltipText )
    return <>
        <div className={ styles.button }
            onClick={ () => setIsOpen( ! isOpen ) }
            onMouseEnter={ () => setIsHovering( true ) }
            onMouseLeave={ () => setIsHovering( false ) }
            { ...referenceProps }
        >
            <Icon of={ iconMaker( isHovering ) }/>
        </div>
        { createPortal(
            <div className={ styles.container } style={ { backdropFilter: `blur( ${ isOpen ? 8 : 0 }px )`, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" } } onClick={ () => setIsOpen( false ) }>
                <div className={ styles.panel } onClick={ e => e.stopPropagation() }>
                    { children }
                </div>
            </div>,
            document.body
        ) }
        { tooltip }
    </>
}
