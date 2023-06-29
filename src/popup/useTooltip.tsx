import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from "@floating-ui/react"
import { ReactNode, useState } from "react"
import styles from "./useTooltip.module.css"
import { createPortal } from "react-dom"
import { Glass } from "./Glass.tsx"
import { transform } from "framer-motion"

export const useTooltip = ( children: ReactNode ) => {
    const [ isOpen, setIsOpen ] = useState( false )
    const { context, x, y, strategy, refs } = useFloating( {
        middleware: [ shift(), flip(), offset( 8 ) ],
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: "top",
        whileElementsMounted: ( ...args ) => autoUpdate( ...args )
    } )
    const hover = useHover( context )
    const { getReferenceProps, getFloatingProps } = useInteractions( [ hover ] )
    const tooltip = createPortal(
        <Glass
            ref={ refs.setFloating }
            style={ {
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                // opacity: isOpen ? 1 : 0,
                // pointerEvents: isOpen ? "auto" : "none"
                "--radius": "8px"
            } }
            { ...getFloatingProps() }
        >
            <div className={ styles.container }>{ children }</div>
        </Glass>,
        document.body
    )
    return { referenceProps: { ref: refs.setReference, ...getReferenceProps() }, tooltip }
}
