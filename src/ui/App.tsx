import React, {FC, Fragment, useCallback, useState} from 'react';
import {assert} from "../lib/assert";

import {db} from "../lib/db";
import {Cache} from "../lib/db/cache/Cache";
import styles from './App.module.sass';
import {AppDocument} from "../AppDocument";
import {Storage} from "../lib/db/storage/Storage";
import {defaults} from "../defaults";
import {CreateCachedTreeView} from "./components/CachedTreeView/CachedTreeView";
import {ThreeColLayout} from "./components/ThreeColLayout/ThreeColLayout";
import {Document} from "./components/Document/Document";
import {CreateDBTreeView} from './components/DBTreeView/DBTreeView';
import {DocumentEditor} from "./components/DocumentEditor/DocumentEditor";

type AppStorage = db.storage.Storage<AppDocument>
type AppCache = db.cache.Cache<AppDocument>

const DBTreeView = CreateDBTreeView({
    DocumentComponent: Document
});

const CachedTreeView = CreateCachedTreeView({
    DocumentComponent: Document,
    DocumentEditorComponent: DocumentEditor,
    documentFactory: {
        create(): AppDocument {
            return "";
        },
    },
});

function createDefaultStorage(): AppStorage {
    return Storage.create(defaults);
}

function createEmptyCache(): AppCache {
    return Cache.create<AppDocument>();
}

export const App: FC = () => {
    const [storage, setStorage] = useState(createDefaultStorage());
    const [cache, setCache] = useState(createEmptyCache());

    const [hack, setHack] = useState(0); // FIXME: use observables for auto re-render

    const onResetClick = useCallback(() => {
        setStorage(createDefaultStorage());
        setCache(createEmptyCache());
    }, [setStorage, setCache]);

    const onDocumentActivated = useCallback((handle: db.DocumentHandle<AppDocument>) => {
        cache.addHandle(JSON.parse(JSON.stringify(handle)));
        setHack(hack => hack + 1);
    }, [cache]);

    const onCacheDocumentRequest = useCallback((path: db.SerializedPath) => {
        const document = storage.queryDocument(path);
        assert(document);
        onDocumentActivated({
            path,
            document,
        });
    }, [storage, onDocumentActivated]);

    const onApplyChangesClick = useCallback(() => {
        const changes = cache.getChanges();
        cache.discardAddedChildren();

        const {affected} = storage.applyChanges(changes);

        for (const path of affected) {
            const changedDocument = storage.queryDocument(path);
            if (changedDocument) {
                cache.addHandle({
                    path,
                    document: changedDocument,
                });
            } else {
                cache.removeHandle(path);
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
                        Cache view. Double click on "Missing document" to pull document from the database. Double click
                        on loaded document to edit it. See context menu for additional actions.
                    </div>
                    <CachedTreeView key={hack} node={cache.root} onDocumentRequest={onCacheDocumentRequest}/>
                </Fragment>
                <Fragment>
                    <div className={styles.Hint}>
                        Database view. Double click to push document into the cache.
                    </div>
                    <DBTreeView node={storage.root} onActivate={onDocumentActivated}/>
                </Fragment>
                <Fragment>
                    <div className={styles.CacheControls}>
                        <button onClick={onApplyChangesClick}>
                            Apply changes ???
                        </button>
                    </div>
                </Fragment>
            </ThreeColLayout>
        </div>
    );
};
