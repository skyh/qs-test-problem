import {FC, useCallback, useEffect} from "react";

import {BodyPortal} from "../BodyPortal/BodyPortal";
import {PopupContent} from "./PopupContent";

import styles from "./Popup.module.sass";
import {PopupLayout} from "./PopupLayout";

interface Props {
    onHide?: () => void
}

const MOUSE_BUTTON_LEFT = 0;

export const Popup: FC<Props> = (props) => {
    const {onHide} = props;

    const onBackdropMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (onHide == null) return;

        if (event.button === MOUSE_BUTTON_LEFT) {
            onHide();
        }
    }, [onHide]);

    useEffect(() => {
        if (onHide == null) return;

        const onWindowKeyDown = (event: KeyboardEvent) => {
            if (event.code === "Escape") {
                onHide();
            }
        };

        window.addEventListener("keydown", onWindowKeyDown);
        return () => {
            window.removeEventListener("keydown", onWindowKeyDown);
        };
    }, [onHide]);

    return (
        <BodyPortal>
            <div className={styles.Popup}>
                <div className={styles.PopupBackdrop} onMouseDown={onBackdropMouseDown}/>
                <PopupLayout>
                    <PopupContent children={props.children}/>
                </PopupLayout>
            </div>
        </BodyPortal>
    );
};
