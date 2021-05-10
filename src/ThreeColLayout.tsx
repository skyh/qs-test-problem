import React, {FC, ReactNode} from "react";

import styles from "./ThreeColLayout.module.sass"

interface Props {
    children: [ReactNode, ReactNode, ReactNode]
}

/**
 * Three columns layout
 *
 * Left and right columns are wide. Center is narrow.
 *
 * @example
 * <ThreeColLayout>
 *     <div>Wide left column</div>
 *     <div>Wide right column</div>
 *     <div>Narrow center column</div>
 * </ThreeColLayout>
 * ```
 */
export const ThreeColLayout: FC<Props> = (props) => (
    <div className={styles.ThreeColLayout}>
        <div className={styles.Left}>
            {props.children[0]}
        </div>
        <div className={styles.Center}>
            {props.children[2]}
        </div>
        <div className={styles.Right}>
            {props.children[1]}
        </div>
    </div>
);
