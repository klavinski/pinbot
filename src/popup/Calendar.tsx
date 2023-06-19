import { Calendar as ReactCalendar } from "react-calendar"
import { createPortal } from "react-dom"
import "react-calendar/dist/Calendar.css"
import "./Calendar.css"

import IconChevronLeft from "~icons/tabler/chevron-left"
import IconChevronRight from "~icons/tabler/chevron-right"
import IconChevronsLeft from "~icons/tabler/chevrons-left"
import IconChevronsRight from "~icons/tabler/chevrons-right"

new Date().setDate( new Date().getDate() - 14 )

export const Calendar = ( { date, setDate, setShown, shown }: { date: string | null, setDate: ( newDate: string | null ) => void, setShown: ( newShown: boolean ) => void, shown: boolean } ) => {
    return createPortal( <div
        className="background"
        onClick={ () => { setDate( null ); setShown( false ) } }
        style={ shown ? undefined : { opacity: 0, pointerEvents: "none" } }
    >
        <span onClick={ e => e.stopPropagation() }>
            <ReactCalendar
                minDate={ new Date( new Date().setDate( new Date().getDate() - 14 ) ) }
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
