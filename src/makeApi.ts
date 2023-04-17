import { z, ZodType } from "zod"

class MapWithDefault<K, V> extends Map<K, V> {
    constructor( private readonly defaultValue: () => V ) { super() }
    get( key: K ) {
        if ( ! this.has( key ) )
            this.set( key, this.defaultValue() )
        return super.get( key )!
    }
}

const objectEntries = Object.entries as <const O extends Record <string, unknown>>( object: O ) => [ keyof O, O[ keyof O ] ][]
const objectFromEntries = Object.fromEntries as <K extends string | number | symbol, V>( entries: ( [K, V] | readonly [K, V] )[] ) => { [ k in K ]: V }

type Action<ZT extends ZodType, F extends string, T extends string, R, S extends Spec> = {
    check: ZT,
    from: F,
    handler: ( message: z.infer<ZT>, api: MakeApi<S, T> ) => R,
    to: T
}

type Spec = { [ action: string ]: Action<ZodType, string, string, unknown, Spec> }

type MakeApi<S extends Spec, F extends S[keyof S]["from"]> = {
    [action in keyof S]: F extends S[action]["from"] ? ( message: z.infer<S[action]["check"]> ) => Promise<Awaited<ReturnType<S[action]["handler"]>>> : never
}

const add = <S extends Spec, const N extends string, ZT extends ZodType, const F extends string, const T extends string, R, S2 extends S>( spec: S, name: N, action: Action<ZT, F, T, R, S2> ) => ( { ...spec, [ name ]: action } )

const build = <const S extends Spec>( spec: S ) => <const C extends S[keyof S][ "from" | "to" ], const Source extends S[keyof S][ "from" | "to" ]>( source: Source, channels: Record<C, {
        addListener: ( listener: ( message: unknown ) => void ) => void,
        send: ( message: unknown ) => void
}> ) => {
    const promiseResolversByChannelByUuid = new MapWithDefault<C, Map<string, ( message: unknown ) => void>>( () => new Map() )
    const sendTo = objectFromEntries( objectEntries( channels ).map( ( [ channel, action ] ) => [ channel, ( message: unknown ) => {
        const uuid = crypto.randomUUID()
        const promise = new Promise( resolver => promiseResolversByChannelByUuid.get( channel )!.set( uuid, resolver ) )
        action.send( { data: message, uuid } )
        return promise
    } ] as const ) )
    const api = objectFromEntries( objectEntries( spec ).filter( ( _ ): _ is [keyof typeof spec, S[keyof S] & { to: S[keyof S]["to"] & keyof typeof sendTo }] => _[ 1 ].to in sendTo ).map( ( [ action, { to } ] ) => [ action, ( message: z.infer<ZodType> ) => sendTo[ to ]( message ) ] as const ) ) as MakeApi<S, Source>
    objectEntries( channels ).forEach( ( [ channelName, channel ] ) => channel.addListener( ( message: unknown ) => {
        const parsing = z.object( { data: z.unknown(), uuid: z.string() } ).safeParse( message )
        if ( parsing.success ) {
            const promiseResolver = promiseResolversByChannelByUuid.get( channelName ).get( parsing.data.uuid )
            if ( promiseResolver )
                promiseResolver( parsing.data.data )
            objectEntries( spec ).forEach( async ( [ actionName, action ] ) => {
                if ( action.to === source && action.check.safeParse( parsing.data.data ).success )
                    if ( action.from in channels )
                        channels[ action.from as C ].send( { data: await action.handler( parsing.data.data, api ), uuid: parsing.data.uuid } )
                    else
                        throw new Error( `No communication channel found for ${ action.from } required by action ${ actionName as string } and message ${ message }.` )
            } )
        }
    } ) )
    return api
}

export const makeApi = <S extends Spec>( spec: S ) => {
    return {
        ...spec,
        add: <const N extends string, const ZT extends ZodType, const F extends string, const T extends string, const R, const S2 extends S>( name: N, action: Action<ZT, F, T, R, S2> ) => makeApi( add( spec, name, action ) ),
        build: <const C extends S[keyof S][ "from" | "to" ], const Source extends S[keyof S][ "from" | "to" ]>( source: Source, channels: Record<C, {
            addListener: ( listener: ( message: unknown ) => void ) => void,
            send: ( message: unknown ) => void
    }> ) => build( spec )( source, channels )
    }
}
