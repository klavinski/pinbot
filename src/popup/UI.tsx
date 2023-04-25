import { MouseEventHandler, ReactNode } from "react"
import browser from "webextension-polyfill"
import styles from "./UI.module.css"

export const UI = ( { children = <div/>, className, href, onClick, prefix = <div/>, suffix = <div/> }: { children?: ReactNode, className?: string, href?: string, onClick?: MouseEventHandler<HTMLDivElement>, prefix: ReactNode, suffix?: ReactNode } ) => <div
    className={ [ styles.container, href ? styles.containerUrl : onClick ? "clickableIcon" : "", className ].join( " " ) }
    onClick={ e => {
        onClick?.( e )
        href && browser.tabs.create( { url: href } )
    } }
>
    <div className={ styles.flex }>{ prefix }</div>
    <div className={ [ styles.children, href ? styles.childrenUrl : "" ].join( " " ) }>{ children }</div>
    <div className={ styles.flex }>{ suffix }</div>
</div>
