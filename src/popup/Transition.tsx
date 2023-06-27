import { motion } from "framer-motion"
import { ReactNode } from "react"
import styles from "./Transition.module.css"

export const Transition = ( { children }: { children: ReactNode } ) =>
    <motion.div
        initial={ { height: 0 } }
        animate={ { height: "auto" } }
        exit={ { height: 0 } }
        className={ styles.container }
    >
        { children }
    </motion.div>
