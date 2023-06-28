import { useEffect, useState } from "react"
import styles from "./index.module.css"
import IconMoon from "~icons/tabler/moon"
import IconSunFilled from "~icons/tabler/sun-filled"

export const Toggle = () => {
    const [ isDark, setIsDark ] = useState( () => window.matchMedia( "( prefers-color-scheme: dark )" ).matches )
    const updateStyle = ( isDark: boolean ) => {
        document.querySelector( ":root" )!.setAttribute( "data-isDark", `${ isDark }` )
        setIsDark( isDark )
    }
    useEffect( () => {
        const darkModePreference = window.matchMedia( "( prefers-color-scheme: dark )" )
        const updateFromOSPreference = async () => {
            const storage = "chrome" in self ? await chrome?.storage?.sync.get() ?? {} : {}
            updateStyle( "isDark" in storage ? storage.isDark : darkModePreference.matches )
        }
        const abortController = new AbortController()
        darkModePreference.addEventListener( "change", updateFromOSPreference, { signal: abortController.signal } )
        updateFromOSPreference()
        return () => abortController.abort()
    }, [] )
    return <div className={ [ styles.container, isDark ? styles.dark : "", styles.clickable ].join( " " ) }
        onClick={ () => {
            "chrome" in self && chrome?.storage?.sync.set( { isDark: ! isDark } )
            updateStyle( ! isDark )
        } }>
        <IconSunFilled className={ styles.sun }/>
        <IconMoon className={ styles.moon }/>
    </div>
}
