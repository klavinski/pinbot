import { ReactNode } from "react"
import styles from "./UI.module.css"

export const UI = ( { children = <div/>, href, prefix = <div/>, suffix = <div/> }: { children?: ReactNode, href?: string, prefix: ReactNode, suffix?: ReactNode } ) => <a className={ [ styles.container, href ? styles.containerUrl : "" ].join( " " ) } href={ href }>
    <div className={ styles.flex }>{ prefix }</div>
    <div className={ [ styles.children, href ? styles.childrenUrl : "" ].join( " " ) }>{ children }</div>
    <div className={ styles.flex }>{ suffix }</div>
</a>
