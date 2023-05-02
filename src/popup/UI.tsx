import { MouseEventHandler, ReactNode } from "react"
import styles from "./UI.module.css"

export const UI = ( { children = <div/>, className, href, onClick, prefix = <div/>, suffix = <div/> }: { children?: ReactNode, className?: string, href?: string, onClick?: MouseEventHandler<HTMLAnchorElement>, prefix: ReactNode, suffix?: ReactNode } ) => <a
    className={ [ styles.container, href ? styles.containerUrl : onClick ? "clickableIcon" : "", className ].join( " " ) }
    onClick={ e => {
        onClick?.( e )
        href && "chrome" in self && chrome.tabs.create( { url: href } )
    } }
    href={ href }
>
    <div className={ styles.flex }>{ prefix }</div>
    <div className={ [ styles.children, href ? styles.childrenUrl : "" ].join( " " ) }>{ children }</div>
    <div className={ styles.flex }>{ suffix }</div>
</a>
