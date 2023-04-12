import { ChangeEvent, useState } from "react"
import { IconArrowRight, IconCalendar, IconCircleMinus, IconCirclePlus, IconClockHour4, IconMoodAnnoyed, IconMoodCry, IconMoodEmpty, IconMoodSad, IconMoodSmile, IconQuote, IconQuoteOff, IconSearch, IconWorldOff, IconWorldWww, IconX } from "@tabler/icons-react"
import { ReactComponent as Icon } from "../../icons/black-icon.svg"
import { Input } from "./Input.tsx"
import { Focus } from "./Focus.tsx"
import "./index.css"
import styles from "./Popup.module.css"
import { usePopup } from "./api.ts"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Calendar } from "./Calendar.tsx"
import { IconSliders04 } from "untitled-ui-icons"

const Confidence = ( { score }: { score: number } ) => <div>
    { score >= 0.8 ? <IconMoodSmile/> :
        score >= 0.6 ? <IconMoodEmpty/> :
            score >= 0.4 ? <IconMoodAnnoyed/> :
                score >= 0.2 ? <IconMoodSad/> :
                    <IconMoodCry/> }
    { Math.round( score * 100 ) }% confidence
</div>

export const Popup = () => {
    const { query, isLoading } = usePopup()
    const [ fields, setFields ] = useState( {
        query: "",
        exact: "",
        from: null as Date | null,
        to: null as Date | null,
        urls: ""
    } )
    const [ output, setOutput ] = useState( [] as Awaited<ReturnType<typeof query>> )
    const [ shown, setShown ] = useState( {
        exactInfo: false,
        fields: false,
        fromCalendar: false,
        toCalendar: false,
        urlInfo: false
    } )
    const FieldsButton = shown.fields ? IconCircleMinus : IconCirclePlus
    const SearchButton = isLoading ? IconClockHour4 : IconSearch
    const ExactInfoButton = shown.exactInfo ? IconQuoteOff : IconQuote
    const UrlInfoButton = shown.urlInfo ? IconWorldOff : IconWorldWww
    const [ parent ] = useAutoAnimate()
    return <div className={ styles.container } ref={ parent } onKeyUp={ e => {
        if ( e.key === "Enter" && fields.query !== "" ) {
            query( fields.query ).then( setOutput )
        }
    } }>
        <div className={ styles.header }>
            <div/>
            <div className={ styles.title }>
                <Icon/><div>VALET</div>
            </div>
            <div className={ styles.myAccount }>
                <IconSliders04/><div>My account</div>
            </div>
        </div>
        <Focus style={ { gridTemplateColumns: "auto 1fr auto" } }>
            <FieldsButton onClick={ () => setShown( { ...shown, fields: ! shown.fields } ) }/>
            <Input
                autoFocus
                disabled={ isLoading }
                placeholder="Natural language search"
                value={ fields.query }
                onChange={ e => setFields( { ...fields, query: e.target.value } ) }
            />
            { fields.query.length === 0 ? <div/> : output.length === 0 ? <SearchButton onClick={ () => query( fields.query ).then( setOutput ) }/> :
                <IconX onClick={ () => setOutput( [] ) }/> }
        </Focus>
        { shown.fields && <>
            <Focus style={ { gridTemplateColumns: "auto 1fr" } }>
                <ExactInfoButton onClick={ () => setShown( { ...shown, exactInfo: ! shown.exactInfo } ) }/>
                <Input placeholder="Exact search"/>
            </Focus>
            { shown.exactInfo && <div>Example: <div className={ styles.quote }>"exact query" -"query to exclude" "prefix*"</div></div> }
            <Focus style={ { gridTemplateColumns: "auto 1fr" } }>
                <UrlInfoButton onClick={ () => setShown( { ...shown, urlInfo: ! shown.urlInfo } ) }/>
                <Input
                    onChange={ ( e: ChangeEvent<HTMLTextAreaElement> ) => setFields( { ...fields, urls: e.target.value } ) }
                    placeholder="Newline-separated URL prefixes"
                    rows={ fields.urls.split( "\n" ).length }
                    value={ fields.urls }
                />
            </Focus>
            { shown.urlInfo && <div>Example: <div className={ styles.quote }>https://wikipedia.org<br/>app.slack.com/client/team-id/channel-id</div></div> }
            <Focus style={ { gridTemplateColumns: "auto 1fr auto 1fr" } }>
                <IconCalendar/>
                <Input
                    onFocus={ () => setShown( { ...shown, fromCalendar: true } ) }
                    placeholder="From"
                    value={ fields.from ? new Date( fields.from ).toLocaleDateString() : "" }
                />
                <IconArrowRight/>
                <Input
                    onFocus={ () => setShown( { ...shown, toCalendar: true } ) }
                    placeholder="To"
                    value={ fields.to ? new Date( fields.to ).toLocaleDateString() : "" }
                />
            </Focus>
            { ( [ "from", "to" ] as const ).map( _ => <Calendar
                date={ fields[ _ ] }
                setDate={ newDate => setFields( { ...fields, [ _ ]: newDate } ) }
                setShown={ newShown => setShown( { ...shown, [ `${ _ }Calendar` ]: newShown } ) }
                shown={ shown[ `${ _ }Calendar` ] }
            /> ) }
        </> }
        { output.map( page => <div>
            <div className={ styles.info }>
                <div><IconWorldWww/><a className={ styles.url }>{ page.url }</a></div>
                ⦁
                <div><IconCalendar/>{ new Date( page.date ).toLocaleDateString() }</div>
                ⦁
                <Confidence score={ Math.max( ...page.sentences.map( _ => _.score ) ) }/>
            </div>
            <div className={ styles.title }>{ page.title }</div>
            <div className={ styles.body }>{ page.sentences.map( _ => _.sentence ).join( "... " ) }</div>
        </div> ) }
        <div className={ styles.footer }>
            Made by Kamil Szczerba — <a className={ styles.url }>Leave feedback</a>
        </div>
    </div>
}
