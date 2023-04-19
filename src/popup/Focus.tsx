import { ComponentPropsWithoutRef, ReactNode, useEffect, useRef } from "react"
import styles from "./Focus.module.css"

const minBy = <T, >( map: ( x: T ) => number, xs: T[] ) => xs.reduce( ( a, b ) => map( a ) < map( b ) ? a : b )

const distance = ( { clientX, clientY }: { clientX: number, clientY: number } ) => ( el: Element ) => {
    const { bottom, left, right, top } = el.getBoundingClientRect()
    return clientX < left && clientY < top ? Math.sqrt( ( left - clientX ) ** 2 + ( top - clientY ) ** 2 ) :
        clientX > right && clientY > bottom ? Math.sqrt( ( right - clientX ) ** 2 + ( bottom - clientY ) ** 2 ) :
            clientX < left && clientY > bottom ? Math.sqrt( ( left - clientX ) ** 2 + ( bottom - clientY ) ** 2 ) :
                clientX > right && clientY < top ? Math.sqrt( ( right - clientX ) ** 2 + ( top - clientY ) ** 2 ) :
                    clientX < left ? left - clientX :
                        clientX > right ? clientX - right :
                            clientY < top ? top - clientY :
                                clientY > bottom ? clientY - bottom :
                                    0
}

export const Focus = ( { className, disabled, ...props }: ComponentPropsWithoutRef<"div"> & { disabled?: boolean } ) => {
    const ref = useRef( null as null | HTMLDivElement )
    useEffect( () => {
        if ( typeof disabled === "boolean" && ref.current ) {
            [ ...ref.current.querySelectorAll( "input" ), ...ref.current.querySelectorAll( "textarea" ) ].forEach( input => input.disabled = disabled )
        }
    }, [ disabled ] )
    return <div
        className={ [ styles.container, disabled ? styles.disabled : styles.active, className ].filter( _ => _ ).join( " " ) }
        onClick={ click => ref.current && minBy( distance( click ), [ ...ref.current.querySelectorAll( "input" ) ] ).focus() }
        ref={ ref }
        { ...props }
    />
}
