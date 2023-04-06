import { z } from "zod"

export const onMessageTo = <T>(
    addListener: ( listener: ( message: T ) => void ) => void,
    removeListener: ( listener: ( message: T ) => void ) => void,
    sendMessage: ( message: unknown ) => void,
    dataFromMessage: ( message: T ) => unknown = ( value: T ) => value,
) => ( to: string ) => ( handler: ( data: unknown ) => unknown ) => {
        const listener = async ( message: T ) => {
            const parseResult = z.object( { data: z.unknown(), from: z.string(), to: z.literal( "offscreen" ), uuid: z.string() } ).safeParse( dataFromMessage( message ) )
            if ( "data" in parseResult ) {
                const response = handler( parseResult.data.data )
                if ( typeof await response !== "undefined" )
                    sendMessage( { data: response, from: to, to: parseResult.data.from, uuid: parseResult.data.uuid } )
            }
        }
        addListener( listener )
        return () => removeListener( listener )
    }

export const sendMessageFrom = <T>(
    addListener: ( listener: ( message: T ) => void ) => void,
    removeListener: ( listener: ( message: T ) => void ) => void,
    sendMessage: ( message: unknown ) => void,
    dataFromMessage: ( message: T ) => unknown = ( value: T ) => value,
) => ( from: string ) => ( data: unknown, to: string ) => new Promise( resolve => {
        const uuid = crypto.randomUUID()
        const listener = ( message: T ) => {
            const parseResult = z.object( { data: z.any(), to: z.literal( from ), uuid: z.literal( uuid ) } )
                .safeParse( dataFromMessage( message ) )
            if ( "data" in parseResult ) {
                removeListener( listener )
                resolve( parseResult.data )
            }
        }
        addListener( listener )
        sendMessage( { data, from, to, uuid } )
        return () => removeListener( listener )
    } )
