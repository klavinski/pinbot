import { useEffect, useState } from "react"
import { IconArrowRight, IconCalendar, IconCircle, IconCircleMinus, IconCirclePlus, IconMessageDots, IconMessages, IconMoodAnnoyed, IconMoodCry, IconMoodEmpty, IconMoodSad, IconMoodSmile, IconPointFilled, IconQuote, IconQuoteOff, IconSearch, IconSwitchHorizontal, IconWorld, IconWorldOff } from "@tabler/icons-react"
import { ReactComponent as Icon } from "../../icons/black-icon.svg"
import { Input } from "./Input.tsx"
import { Focus } from "./Focus.tsx"
import "./index.css"
import styles from "./Popup.module.css"
import { usePopup } from "./api.ts"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Calendar } from "./Calendar.tsx"
import { Query } from "./types.ts"

import { UI } from "./UI.tsx"
import { Toggle } from "./Toggle/index.tsx"
import { Clock } from "./Clock.tsx"
import { AccountButton } from "./Account.tsx"
import { Tooltip } from "./Tooltip.tsx"
import { maximumIndex } from "../utils.ts"
import { AlertsButton } from "./Alerts.tsx"

import manifest from "../../manifest.json"
import { IconCheckCircle } from "untitled-ui-icons"

const initialFields = {
    query: "",
    exact: "",
    from: null,
    to: null,
    url: ""
} as Query

const useSessionState = <T, >( key: string, initialState: T | ( () => T ) ) => {
    const [ state, setState ] = useState( initialState )
    useEffect( () => { chrome.storage.session.get().then( _ => key in _ && setState( _[ key ] ) ) }, [] )
    useEffect( () => { chrome.storage.session.set( { [ key ]: state } ) }, [ state ] )
    return [ state, setState ] as const
}

const Confidence = ( { score }: { score: number } ) => {
    return <UI prefix={
        score >= 0.8 ? <IconMoodSmile/> :
            score >= 0.6 ? <IconMoodEmpty/> :
                score >= 0.4 ? <IconMoodAnnoyed/> :
                    score >= 0.2 ? <IconMoodSad/> :
                        <IconMoodCry/> }>
        { score > 1 ? 100 : score < 0 ? 0 : Math.round( score * 100 ) } % confidence
    </UI>
}

export const Popup = () => {
    const { isLoading, search } = usePopup()
    const [ fields, setFields ] = useSessionState( "fields", initialFields )
    const [ output, setOutput ] = useSessionState( "output", [] as Awaited<ReturnType<typeof search>> )
    const [ shown, setShown ] = useSessionState( "shown", {
        exactInfo: false,
        fields: false,
        fromCalendar: false,
        toCalendar: false,
        urlInfo: false
    } )
    const [ order, setOrder ] = useSessionState( "order", "sentence" as "page" | "sentence" )
    const FieldsButton = shown.fields ? IconCircleMinus : IconCirclePlus
    const ExactInfoButton = shown.exactInfo ? IconQuoteOff : IconQuote
    const UrlInfoButton = shown.urlInfo ? IconWorldOff : IconWorld
    const [ parent ] = useAutoAnimate()
    return <div className={ styles.container } ref={ parent } onKeyUp={ e => {
        if ( e.key === "Enter" && fields.query && ! isLoading )
            search( fields ).then( setOutput )
    } }>
        <div className={ styles.header }>
            <div/>
            <div className={ styles.wordmark }>
                Pin<Icon className={ styles.logo }/>bot
            </div>
            <div className={ styles.buttons }>
                <Tooltip content="Light/dark mode"><Toggle/></Tooltip>
                <Tooltip content="Alerts"><AlertsButton/></Tooltip>
                <Tooltip content="Account settings"><AccountButton/></Tooltip>
            </div>
        </div>
        <Focus disabled={ isLoading }><UI prefix={
            <FieldsButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, fields: ! shown.fields } ) }/>
        } suffix={
            isLoading ? <Clock/> : fields.query ? <IconSearch className={ "clickableIcon" } onClick={ () => search( fields ).then( setOutput ) }/> : <div/>
        }>
            <Input
                autoFocus
                placeholder="Natural language search"
                value={ fields.query }
                onChange={ query => setFields( { ...fields, query } ) }
            />
        </UI>
        </Focus>
        { shown.fields && <>
            <Focus disabled={ isLoading }><UI prefix={
                <ExactInfoButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, exactInfo: ! shown.exactInfo } ) }/>
            }>
                <Input placeholder="Exact search" value={ fields.exact } onChange={ exact => setFields( { ...fields, exact } ) }/>
            </UI>
            </Focus>
            { shown.exactInfo && <div>Words can appear in any order. Use <div className={ styles.quote }>NOT</div> to exclude words. Examples:<br/>
                <UI prefix={ <IconPointFilled/> }>
                    <div className={ styles.quote }>include these words</div>
                </UI>
                <UI prefix={ <IconPointFilled/> }><div>
                    <div className={ styles.quote }>include these words NOT exclude these words</div>
                </div></UI>
            </div> }
            <Focus disabled={ isLoading }><UI prefix={
                <UrlInfoButton className={ "clickableIcon" } onClick={ () => setShown( { ...shown, urlInfo: ! shown.urlInfo } ) }/>
            }>
                <Input
                    onChange={ url => setFields( { ...fields, url } ) }
                    placeholder="URL"
                    value={ fields.url }
                />
            </UI></Focus>
            { shown.urlInfo && <div>
                Use <div className={ styles.quote }>*</div> as a wildcard. Examples:
                <UI prefix={ <IconPointFilled/> }><div>
                    Videos from any YouTube channel: <div className={ styles.quote }>youtube.com/@*/videos</div>
                </div></UI>
                <UI prefix={ <IconPointFilled/> }><div>
                    A slack channel: <div className={ styles.quote }>app.slack.com/client/team-id/channel-id</div>
                </div></UI>
            </div> }
            <Focus disabled={ isLoading }><UI prefix={
                <IconCalendar className={ "clickableIcon" } onClick={ e => { e.stopPropagation(); setShown( { ...shown, fromCalendar: true } ) } }/>
            }>
                <Input
                    onFocus={ () => setShown( { ...shown, fromCalendar: true } ) }
                    placeholder="From"
                    value={ fields.from ? new Date( fields.from ).toLocaleDateString() : "" }
                /></UI><UI prefix={
                <IconArrowRight className={ "clickableIcon" } onClick={ e => { e.stopPropagation(); setShown( { ...shown, toCalendar: true } ) } }/>
            }>
                <Input
                    onFocus={ () => setShown( { ...shown, toCalendar: true } ) }
                    placeholder="To"
                    value={ fields.to ? new Date( fields.to ).toLocaleDateString() : "" }
                />
            </UI></Focus>
            { ( [ "from", "to" ] as const ).map( _ => <Calendar
                date={ fields[ _ ] }
                setDate={ newDate => setFields( { ...fields, [ _ ]: newDate, ...( {
                    from: { to: newDate && fields.to && newDate > fields.to ? null : fields.to },
                    to: { from: newDate && fields.from && newDate < fields.from ? null : fields.from }
                }[ _ ] ) } ) }
                setShown={ newShown => setShown( { ...shown, [ `${ _ }Calendar` ]: newShown } ) }
                shown={ shown[ `${ _ }Calendar` ] }
            /> ) }
            <div className={ styles.order }>
                Order by&nbsp;
                <div className={ [ styles.orderLabel, "clickableIcon" ].join( " " ) } onClick={ () => setOrder( ( { sentence: "page", page: "sentence" } as const )[ order ] ) }>
                    <div className={ order !== "page" ? styles.rotated : undefined }>page</div>
                    <div className={ order !== "sentence" ? styles.rotated : undefined }>sentence</div>
                </div>
                &nbsp;score
            </div>
        </> }
        { output.sort( ( a, b ) => ( {
            page: b.score - a.score,
            sentence: ( Math.max( ...b.sentences.map( _ => _.score ) ) - Math.max( ...a.sentences.map( _ => _.score ) ) )
        }[ order ] ) ).map( page => {
            const url = new URL( chrome.runtime.getURL( "/_favicon/" ) )
            url.searchParams.set( "pageUrl", page.url )
            url.searchParams.set( "size", "32" )
            const [ title, ...body ] = page.sentences
            const bestIndex = maximumIndex( body, "score" )
            const before = body[ bestIndex - 1 ]?.text
            const after = body[ bestIndex + 1 ]?.text
            return <div>
                <div className={ styles.info }>
                    <Tooltip content={ page.url }>
                        <UI prefix={ <img className={ styles.favicon } src={ url.toString() }/> } href={ page.url }>
                            <div className={ styles.shrinkable }>{ page.url }</div>
                        </UI>
                    </Tooltip>
                ⦁
                    <UI prefix={ <IconCalendar/> }>{ new Date( page.date ).toLocaleDateString() }</UI>
                ⦁
                    <Confidence score={ { page: page.score, sentence: Math.max( ...page.sentences.map( _ => _.score ) ) }[ order ] }/>
                </div>
                <div className={ styles.bold }>{ page.title }</div>
                <div className={ styles.body }>
                    { before && `${ before } ` }
                    <span className={ styles.bold }>{ body[ bestIndex ].text }</span>
                    { after && ` ${ after }` }
                </div>
            </div> } ) }
        <div className={ styles.footer }>
            v{ manifest.version } —&nbsp;
            <UI href="https://tally.so/create" prefix={ <IconMessageDots/> }>Leave feedback</UI>
            &nbsp;—&nbsp;
            <UI href="https://discord.gg/NetMteXfjf" prefix={ <IconMessages/> }>Meet the community</UI>
        </div>
    </div>
}
