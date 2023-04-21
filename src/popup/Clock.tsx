import { IconClockHour12, TablerIconsProps } from "@tabler/icons-react"
import { useEffect, useState } from "react"

export const Clock = ( props: TablerIconsProps ) => {
    const [ time, setTime ] = useState( 0 )
    useEffect( () => {
        const interval = setInterval( () => setTime( time => time + 1 ), 1000 )
        return () => clearInterval( interval )
    }, [] )
    return <>
        <IconClockHour12 { ...props } style={ { transform: `rotate( ${ 30 * Math.floor( time / 12 ) }deg )` } }/>
        <IconClockHour12 { ...props } style={ { transform: `rotate( ${ 30 * Math.floor( time ) }deg )`, position: "absolute" } }/>
    </>
}
