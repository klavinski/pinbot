import { createContext } from "react"
import { popupApi } from "../api.ts"
import { useContext } from "react"

const api = popupApi()
const apiContext = createContext( api )

export const ApiProvider = ( { children }: { children: React.ReactNode } ) => <apiContext.Provider value={ api }>{ children }</apiContext.Provider>
export const useApi = () => useContext( apiContext )
