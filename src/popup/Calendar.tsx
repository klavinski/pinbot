import { Calendar as ReactCalendar } from "react-calendar"
import { createPortal } from "react-dom"
import "react-calendar/dist/Calendar.css"
import "./Calendar.css"
import styles from "./Calendar.module.css"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"

export const Calendar = ( { date, setDate, setShown, shown }: { date: string | null, setDate: ( newDate: string | null ) => void, setShown: ( newShown: boolean ) => void, shown: boolean } ) => {
    return createPortal( <div
        className={ styles.background }
        onClick={ () => { setDate( null ); setShown( false ) } }
        style={ shown ? undefined : { opacity: 0, pointerEvents: "none" } }
    >
        <span onClick={ e => e.stopPropagation() } className={ styles.container }>
            <ReactCalendar
                maxDate={ new Date() }
                prevLabel={ <IconChevronLeft/> }
                prev2Label={ <IconChevronsLeft/> }
                nextLabel={ <IconChevronRight/> }
                next2Label={ <IconChevronsRight/> }
                value={ date ? new Date( date ) : undefined }
                onChange={ newDate => { if ( ! ( newDate instanceof Date ) ) throw new TypeError( `Not a date: ${ newDate }` ); setDate( newDate.toISOString() ); setShown( false ) } }
            />
        </span>
    </div>, document.body )
}
