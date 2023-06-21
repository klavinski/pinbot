import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { App } from "./App.tsx"
import { ApiProvider } from "./api.tsx"
import "./index.css"

createRoot( document.getElementById( "root" )! ).render(
    <StrictMode>
        <ApiProvider>
            <App/>
        </ApiProvider>
    </StrictMode>
)
