import { useEffect, useState } from "react"
import styles from "./DarkMode.module.css"
import IconTablerMoon from "~icons/tabler/moon"
import IconTablerSunFilled from "~icons/tabler/sun-filled"
import IconTablerMoonStars from "~icons/tabler/moon-stars"
import IconTablerCloudFilled from "~icons/tabler/cloud-filled"

export const DarkMode = () => {
    const [ isDark, setIsDark ] = useState( () => window.matchMedia( "( prefers-color-scheme: dark )" ).matches )
    const updateStyle = ( isDark: boolean ) => {
        document.querySelector( ":root" )!.setAttribute( "data-isDark", `${ isDark }` )
        setIsDark( isDark )
    }
    const [ isHovering, setIsHovering ] = useState( false )
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
    return <div className={ [ styles.container, isDark ? styles.dark : "" ].join( " " ) }
        onClick={ () => {
            "chrome" in self && chrome?.storage?.sync.set( { isDark: ! isDark } )
            updateStyle( ! isDark )
        } }
        onMouseEnter={ () => setIsHovering( true ) }
        onMouseLeave={ () => setIsHovering( false ) }
    >
        <IconTablerSunFilled className={ styles.sun }/>
        <IconTablerCloudFilled className={ styles.cloud1 }/>
        <IconTablerCloudFilled className={ styles.cloud2 }/>
        <IconTablerMoon className={ styles.moon } style={ { opacity: isHovering ? 0 : 1 } }/>
        <IconTablerMoonStars className={ styles.moon }style={ { opacity: isHovering ? 1 : 0 } }/>
    </div>
}
