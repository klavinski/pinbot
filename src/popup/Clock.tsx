import { IconClockHour12, TablerIconsProps } from "@tabler/icons-react"
import styles from "./Clock.module.css"

export const Clock = ( props: TablerIconsProps ) => {
    return <>
        <IconClockHour12 className={ styles.seconds } { ...props }/>
        <IconClockHour12 className={ styles.minutes } { ...props }/>
    </>
}
