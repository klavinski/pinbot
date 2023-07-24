import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import "../ext/index.css"

( {
    ext: () => import( "../ext/popup/App" ),
    web: () => import( "../web" ),
}[ import.meta.env.MODE ]!().then( ( { default: App } ) =>
    createRoot( document.getElementById( "root" )! ).render(
        <StrictMode>
            <App/>
        </StrictMode>
    ) )
)
