import { IconClockHour1, IconClockHour10, IconClockHour11, IconClockHour12, IconClockHour2, IconClockHour3, IconClockHour4, IconClockHour5, IconClockHour6, IconClockHour7, IconClockHour8, IconClockHour9, TablerIconsProps } from "@tabler/icons-react"
import { useEffect, useState } from "react"

export const Clock = ( props: TablerIconsProps ) => {
    const [ time, setTime ] = useState( 0 )
    useEffect( () => {
        const interval = setInterval( () => setTime( time => ( time + 1 ) % 12 ), 1000 )
        return () => clearInterval( interval )
    }, [] )
    const Element = [ IconClockHour12, IconClockHour1, IconClockHour2, IconClockHour3, IconClockHour4, IconClockHour5, IconClockHour6, IconClockHour7, IconClockHour8, IconClockHour9, IconClockHour10, IconClockHour11 ][ time ]
    return <Element { ...props }/>
}
