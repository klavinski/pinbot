import { autoUpdate, flip, Placement, shift, useFloating, useHover, useInteractions } from "@floating-ui/react"
import { CSSProperties, ReactNode, useState } from "react"
import styles from "./useTooltip.module.css"
import { createPortal } from "react-dom"
import { Glass } from "./Glass.tsx"

export const useTooltip = ( { content, isOpen: programmaticIsOpen, placement = "top", pointerEvents }: { content: ReactNode, isOpen?: boolean, placement?: Placement, pointerEvents?: CSSProperties["pointerEvents"] } ) => {
    const [ isOpen, setIsOpen ] = useState( false )
    const open = typeof programmaticIsOpen === "boolean" ? programmaticIsOpen : isOpen
    const { context, x, y, strategy, refs } = useFloating( {
        middleware: [ shift(), flip() ],
        open: typeof programmaticIsOpen === "boolean" ? programmaticIsOpen : isOpen,
        onOpenChange: setIsOpen,
        placement,
        whileElementsMounted: ( ...args ) => autoUpdate( ...args )
    } )
    const hover = useHover( context )
    const { getReferenceProps, getFloatingProps } = useInteractions( [ hover ] )
    const tooltip = createPortal(
        <Glass
            ref={ refs.setFloating }
            className={ styles.tooltip }
            style={ {
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 3,
                opacity: open ? 1 : 0,
                pointerEvents: typeof pointerEvents !== "undefined" ? pointerEvents : open ? "all" : "none"
            } }
            { ...getFloatingProps() }
        >
            <div className={ styles.container }>{ content }</div>
        </Glass>,
        document.body
    )
    return { referenceProps: { ref: refs.setReference, ...getReferenceProps() }, tooltip }
}
