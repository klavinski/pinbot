import { motion } from "framer-motion"
import { ComponentPropsWithoutRef, ReactNode } from "react"
import styles from "./Transition.module.css"

export const Transition = ( { children, className, ...props }: { children: ReactNode } & ComponentPropsWithoutRef<typeof motion.div> ) =>
    <motion.div
        initial={ { height: 0 } }
        animate={ { height: "auto", overflow: "hidden" } }
        exit={ { height: 0 } }
        className={ [ styles.container, className ].filter( _ => _ ).join( " " ) }
        { ...props }
    >
        { children }
    </motion.div>
