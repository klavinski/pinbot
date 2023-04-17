import { ReactNode } from "react"
import browser from "webextension-polyfill"
import styles from "./UI.module.css"

export const UI = ( { children = <div/>, href, prefix = <div/>, suffix = <div/> }: { children?: ReactNode, href?: string, prefix: ReactNode, suffix?: ReactNode } ) => <div
    className={ [ styles.container, href ? styles.containerUrl : "" ].join( " " ) }
    onClick={ href ? () => browser.tabs.create( { url: href } ) : undefined }
>
    <div className={ styles.flex }>{ prefix }</div>
    <div className={ [ styles.children, href ? styles.childrenUrl : "" ].join( " " ) }>{ children }</div>
    <div className={ styles.flex }>{ suffix }</div>
</div>
