import {FC} from "react";

import styles from "./Popup.module.sass";

export const PopupContent: FC = (props) => {
    return (
        <div className={styles.PopupContent}>
            {props.children}
        </div>
    )
};
