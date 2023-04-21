import { useEffect, useState } from "react"
import styles from "./index.module.css"
import { IconMoon, IconSunFilled } from "@tabler/icons-react"

export const Toggle = () => {
    const [ isDark, setIsDark ] = useState( () => window.matchMedia( "( prefers-color-scheme: dark )" ).matches )
    const updateStyle = ( isDark: boolean ) => {
        document.querySelector( ":root" )!.setAttribute( "data-isDark", `${ isDark }` )
        setIsDark( isDark )
    }
    useEffect( () => {
        const darkModePreference = window.matchMedia( "( prefers-color-scheme: dark )" )
        const updateFromOSPreference = async () => {
            const storage = await chrome.storage.sync.get()
            updateStyle( "isDark" in storage ? storage.isDark : darkModePreference.matches )
        }
        const abortController = new AbortController()
        darkModePreference.addEventListener( "change", updateFromOSPreference, { signal: abortController.signal } )
        updateFromOSPreference()
        return abortController.abort
    }, [] )
    return <div className={ [ styles.container, isDark ? styles.dark : "", "clickableIcon" ].join( " " ) }
        onClick={ () => {
            chrome.storage.sync.set( { isDark: ! isDark } )
            updateStyle( ! isDark )
        } }>
        <IconSunFilled className={ styles.sun }/>
        <IconMoon className={ styles.moon }/>
    </div>
}
