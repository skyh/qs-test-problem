import {FC, RefObject, useEffect, useMemo, useRef} from "react";
import {BodyPortal} from "../BodyPortal/BodyPortal";

import styles from "./ContextMenu.module.sass";
import {ContextMenuContent} from "./ContextMenuContent";
import {ContextMenuPosition} from "./ContextMenuPosition";

interface Props {
    position: ContextMenuPosition
    onDeactivate: () => void
}

export const ContextMenu: FC<Props> = (props) => {
    const style = useMemo(() => {
        const offset = [1, -6];
        return {
            left: props.position[0] + offset[0],
            top: props.position[1] + offset[1],
        };
    }, [props.position]);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDocumentMouseDown = (event: MouseEvent) => {
            if (!isEventInsideRef(event, containerRef)) {
                props.onDeactivate();
            }
        };

        const onDocumentKeyDown = (event: KeyboardEvent) => {
            if (event.code === "Escape") {
                props.onDeactivate();
            }
        };

        const onWindowResize = () => {
            props.onDeactivate();
        };

        const onWindowBlur = () => {
            props.onDeactivate();
        };

        document.addEventListener("mousedown", onDocumentMouseDown, {capture: true});
        document.addEventListener("keydown", onDocumentKeyDown, {capture: true});
        window.addEventListener("resize", onWindowResize, {passive: true});
        window.addEventListener("blur", onWindowBlur, {passive: true});

        return () => {
            document.removeEventListener("mousedown", onDocumentMouseDown, {capture: true});
            document.removeEventListener("keydown", onDocumentKeyDown, {capture: true});
            window.removeEventListener("resize", onWindowResize);
            window.removeEventListener("blur", onWindowBlur);
        };
    });

    return (
        <BodyPortal>
            <div className={styles.ContextMenu} style={style} ref={containerRef}>
                <ContextMenuContent children={props.children}/>
            </div>
        </BodyPortal>
    );
}

function isNode(target: any): target is Node {
    return target && target instanceof Node;
}

function isEventInsideRef<T extends Node>(event: Event, ref: RefObject<T>) {
    const {current: container} = ref;
    if (!container) return false;
    const {target} = event;
    if (isNode(target)) {
        return container.contains(target);
    }
}
