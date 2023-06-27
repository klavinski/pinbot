import { ComponentPropsWithoutRef, ReactNode, useEffect, useRef, useState } from "react"
import { icons } from "../icons.tsx"
import { useApi } from "./api.tsx"
import styles from "./Icon.module.css"

export const Icon = ( { className, of, ...props }: { of: ReactNode } & ComponentPropsWithoutRef<"div"> ) => {
    const [ element, setElement ] = useState( <></> )
    const api = useApi()
    useEffect( () => {
        if ( typeof of === "string" )
            api.getIcon( of )
                .then( _ => icons[ _ ] )
                .then( _ => setElement( <_/> ) )
        else
            setElement( <>{ of }</> )
    }, [ of, api ] )
    return <div className={ [ styles.container, props.onClick ? styles.clickable : undefined, className ].filter( _ => _ ).join( " " ) } { ...props }>
        <div className={ styles.frame }>
            { element }
        </div>
    </div>
}
