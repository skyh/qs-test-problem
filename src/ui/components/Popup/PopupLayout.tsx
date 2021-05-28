import {FC} from "react";

import styles from "./Popup.module.sass";

export const PopupLayout: FC = ({children}) => (
    <div className={styles.PopupLayout} children={children}/>
)
