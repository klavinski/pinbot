import IconClockHour12 from "~icons/tabler/clock-hour-12"
import styles from "./Clock.module.css"
import { ComponentPropsWithoutRef } from "react"

export const Clock = ( props: ComponentPropsWithoutRef<typeof IconClockHour12> ) => {
    return <>
        <IconClockHour12 className={ styles.seconds } { ...props }/>
        <IconClockHour12 className={ styles.minutes } { ...props }/>
    </>
}
