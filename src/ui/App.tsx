import React, {FC, Fragment, useCallback, useState} from 'react';

import styles from './App.module.sass';
import {AppDocument} from "../AppDocument";
import {InMemoryStorage} from "../lib/InMemoryStorage";
import {defaults} from "../defaults";
import {ThreeColLayout} from "./components/ThreeColLayout/ThreeColLayout";
import {Document} from "./Document";
import {CreateDBTreeView} from './components/DBTreeView/DBTreeView';

const DBTreeView = CreateDBTreeView({
    DocumentComponent: Document
});

export const App: FC = () => {
    const [storage, setStorage] = useState(InMemoryStorage.create<AppDocument>());

    const onResetClick = useCallback(() => {
        setStorage(InMemoryStorage.create(defaults));
    }, []);

    const onDocumentSelected = useCallback((handle: db.DocumentHandle<AppDocument>) => {
        console.log("onDocumentSelected", handle)
    }, []);

    return (
        <div className={styles.App}>
            <h1>Cached Tree View Problem</h1>
            <button onClick={onResetClick}>
                Reset
            </button>
            <ThreeColLayout>
                <DBTreeView nodes={storage.root.children} onSelect={onDocumentSelected}/>
                <Fragment>
                    Cache view
                </Fragment>
                <Fragment>
                    controls
                </Fragment>
            </ThreeColLayout>
        </div>
    );
};
