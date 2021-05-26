import React, {FC, Fragment, useCallback, useState} from 'react';
import {assert} from "../lib/assert";

import {db} from "../lib/db/db";
import {StoragePartialView} from "../lib/StoragePartialView";
import styles from './App.module.sass';
import {AppDocument} from "../AppDocument";
import {InMemoryStorage} from "../lib/InMemoryStorage";
import {defaults} from "../defaults";
import {CreateCachedTreeView} from "./components/CachedTreeView/CachedTreeView";
import {ThreeColLayout} from "./components/ThreeColLayout/ThreeColLayout";
import {Document} from "./Document";
import {CreateDBTreeView} from './components/DBTreeView/DBTreeView';
import {DocumentEditor} from "./DocumentEditor";

const DBTreeView = CreateDBTreeView({
    DocumentComponent: Document
});

const CachedTreeView = CreateCachedTreeView({
    DocumentComponent: Document,
    DocumentEditorComponent: DocumentEditor,
});

export const App: FC = () => {
    const [storage, setStorage] = useState(InMemoryStorage.create<AppDocument>());
    const [cache, setCache] = useState(StoragePartialView.create<AppDocument>());

    const [hack, setHack] = useState(0); // FIXME: use observables for auto re-render

    const onResetClick = useCallback(() => {
        setStorage(InMemoryStorage.create<AppDocument>(defaults));
        setCache(StoragePartialView.create<AppDocument>());
    }, [setStorage, setCache]);

    const onDocumentActivated = useCallback((handle: db.DocumentHandle<AppDocument>) => {
        cache.addHandle(JSON.parse(JSON.stringify(handle)));
        setHack(hack => hack + 1);
    }, [cache]);

    const onDocumentRequest = useCallback((path: db.EncodedNodePath) => {
        const document = storage.queryDocument(path);
        assert(document);
        onDocumentActivated({
            path,
            document,
        });
    }, [storage]);

    return (
        <div className={styles.App}>
            <h1>Cached Tree View Problem</h1>
            <button onClick={onResetClick}>
                Reset
            </button>
            <ThreeColLayout>
                <DBTreeView nodes={storage.root.children} onActivate={onDocumentActivated}/>
                <CachedTreeView key={hack} nodes={cache.root.children} onDocumentRequest={onDocumentRequest}/>
                <Fragment>
                    controls
                </Fragment>
            </ThreeColLayout>
        </div>
    );
};
