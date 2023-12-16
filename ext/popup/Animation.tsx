import check from "react-useanimations/lib/checkmark"
import search from "react-useanimations/lib/searchToX"
import remove from "react-useanimations/lib/trash"
import bookmark from "./bookmark.json"
import { Lottie } from "@crello/react-lottie"
import styles from "./Animation.module.css"
import info from "react-useanimations/lib/info"
import subscriptions from "react-useanimations/lib/mail"
import { ComponentPropsWithRef } from "react"
const animations = {
    bookmark: { animationData: bookmark },
    check,
    info,
    subscriptions,
    remove,
    search
}

export const Animation = ( { direction, of, ...props }: { of: keyof typeof animations } & Omit<ComponentPropsWithRef<typeof Lottie>, "config"> ) => <Lottie
    config={ { animationData: animations[ of ].animationData, ...( of === "bookmark" ? { initialSegment: [ 0, 62 ] } : { } ) } }
    className={ of === "bookmark" ? styles.bookmark : styles.container }
    style={ of === "bookmark" ? { filter: direction === 1 ? "brightness( 1 )" : undefined } : undefined }
    direction={ direction }
    { ...props }
/>