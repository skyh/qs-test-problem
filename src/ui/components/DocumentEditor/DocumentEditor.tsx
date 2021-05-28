import {FormEventHandler, useCallback, useRef} from "react";

import {AppDocument} from "../../../AppDocument";
import { assert } from "../../../lib/assert";

import styles from "./DocumentEditor.module.sass";

interface Props {
    document: AppDocument
    onEdited: (document: AppDocument) => void
}

export const DocumentEditor = (props: Props) => {
    const onFormSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        props.onEdited(getDocument());
    }, [props]);

    const inputRef = useRef<HTMLInputElement>(null);

    function getDocument(): AppDocument {
        assert(inputRef.current);
        return inputRef.current.value;
    }

    return (
        <form className={styles.DocumentEditor} onSubmit={onFormSubmit}>
            <input ref={inputRef} autoFocus type="text" defaultValue={props.document}/>
            <button className={styles.OKButton} type="submit">OK</button>
        </form>
    );
}
