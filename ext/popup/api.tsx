import { createContext, useContext } from "react"
import type { Api } from "../offscreen/api.ts"

const api = new Proxy( {}, {
    get: ( _, key: string ) => async ( ...args: unknown[] ) => chrome.runtime.sendMessage( { [ key ]: args } )
} ) as Api

const apiContext = createContext( api )

export const ApiProvider = ( { children }: { children: React.ReactNode } ) => <apiContext.Provider value={ api }>{ children }</apiContext.Provider>

export const useApi = () => useContext( apiContext )
