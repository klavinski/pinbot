import { flip, offset, shift, useFloating, useHover, useInteractions } from "@floating-ui/react"
import { ReactNode, useState } from "react"
import styles from "./Tooltip.module.css"

export const Tooltip = ( { content, children }: { children: ReactNode, content: ReactNode } ) => {
    const [ isOpen, setIsOpen ] = useState( false )
    const { context, x, y, strategy, refs } = useFloating( {
        middleware: [ shift(), flip(), offset( 8 ) ],
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: "top"
    } )
    const hover = useHover( context )
    const { getReferenceProps, getFloatingProps } = useInteractions( [ hover ] )
    return <div className={ styles.container }>
        <div ref={ refs.setReference } { ...getReferenceProps() }>{ children }</div>
        <div
            className={ styles.tooltip }
            ref={ refs.setFloating }
            style={ {
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? "auto" : "none"
            } }
            { ...getFloatingProps() }
        >
            { content }
        </div>
    </div>
}
