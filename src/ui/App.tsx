import React, {FC, Fragment, useCallback, useState} from 'react';
import {assert} from "../lib/assert";

import {db} from "../lib/db/db";
import {StoragePartialView} from "../lib/StoragePartialView";
import styles from './App.module.sass';
import {AppDocument} from "../AppDocument";
import {InMemoryStorage} from "../lib/InMemoryStorage";
import {defaults} from "../defaults";
import {CreateCachedTreeView} from "./components/CachedTreeView/CachedTreeView";
import {ContextMenu} from "./components/ContextMenu/ContextMenu";
import {ThreeColLayout} from "./components/ThreeColLayout/ThreeColLayout";
import {Document} from "./components/Document/Document";
import {CreateDBTreeView} from './components/DBTreeView/DBTreeView';
import {DocumentEditor} from "./components/DocumentEditor/DocumentEditor";

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
    const resetCache = useCallback(() => {
        const newCache = StoragePartialView.create<AppDocument>();
        setCache(newCache);
        return newCache;
    }, [setCache]);

    const [hack, setHack] = useState(0); // FIXME: use observables for auto re-render

    const onResetClick = useCallback(() => {
        setStorage(InMemoryStorage.create<AppDocument>(defaults));
        setCache(StoragePartialView.create<AppDocument>());
    }, [setStorage, setCache]);

    const onDocumentActivated = useCallback((handle: db.DocumentHandle<AppDocument>) => {
        cache.addHandle(JSON.parse(JSON.stringify(handle)));
        setHack(hack => hack + 1);
    }, [cache]);

    const onCacheDocumentRequest = useCallback((path: db.EncodedNodePath) => {
        const document = storage.queryDocument(path);
        assert(document);
        onDocumentActivated({
            path,
            document,
        });
    }, [storage, onDocumentActivated]);

    const onApplyChangesClick = useCallback(() => {
        const changes = cache.getChanges();
        storage.applyChanges(changes);

        for (const change of changes) {
            const changedDocument = storage.queryDocument(change.handlePath);
            if (changedDocument) {
                console.log("add changed document", change.handlePath, changedDocument)
                cache.addHandle({
                    path: change.handlePath,
                    document: changedDocument,
                });
            }
        }
        setHack(x => x + 1);
    }, [storage, cache, setHack]);

    return (
        <div className={styles.App}>
            <h1>Cached Tree View Problem</h1>
            <div className={styles.TopControls}>
                <button onClick={onResetClick}>
                    Reset
                </button>
            </div>
            <ThreeColLayout>
                <Fragment>
                    <div className={styles.Hint}>
                        Cache view. Double click on "Missing document" to request it from the database.
                    </div>
                    <CachedTreeView key={hack} nodes={cache.root.children} onDocumentRequest={onCacheDocumentRequest}/>
                </Fragment>
                <Fragment>
                    <div className={styles.Hint}>
                        Database view. Double click to push document into the cache.
                    </div>
                    <DBTreeView nodes={storage.root.children} onActivate={onDocumentActivated}/>
                </Fragment>
                <Fragment>
                    <div className={styles.CacheControls}>
                        <button onClick={onApplyChangesClick}>
                            Apply changes →
                        </button>
                    </div>
                </Fragment>
            </ThreeColLayout>
        </div>
    );
};
