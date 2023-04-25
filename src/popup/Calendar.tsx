import { Calendar as ReactCalendar } from "react-calendar"
import { createPortal } from "react-dom"
import "react-calendar/dist/Calendar.css"
import "./Calendar.css"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"

new Date().setMonth( new Date().getMonth() - 1 )

export const Calendar = ( { date, setDate, setShown, shown }: { date: string | null, setDate: ( newDate: string | null ) => void, setShown: ( newShown: boolean ) => void, shown: boolean } ) => {
    return createPortal( <div
        className="background"
        onClick={ () => { setDate( null ); setShown( false ) } }
        style={ shown ? undefined : { opacity: 0, pointerEvents: "none" } }
    >
        <span onClick={ e => e.stopPropagation() }>
            <ReactCalendar
                minDate={ new Date( new Date().setMonth( new Date().getMonth() - 1 ) ) }
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
