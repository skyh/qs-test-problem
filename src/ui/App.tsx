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
import {Document} from "./components/Document/Document";
import {CreateDBTreeView} from './components/DBTreeView/DBTreeView';
import {DocumentEditor} from "./components/DocumentEditor/DocumentEditor";

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

function createDefaultStorage() {
    return InMemoryStorage.create<AppDocument>(defaults);
}

function createEmptyCache() {
    return StoragePartialView.create<AppDocument>();
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
            // FIXME: get rid of ifs
            if (change.type === "changed") {
                const changedDocument = storage.queryDocument(change.handlePath);
                assert(changedDocument);

                cache.addHandle({
                    path: change.handlePath,
                    document: changedDocument,
                });

                if ("added" in change) {
                    console.log("TODO: sync added documents");
                }
            } else if (change.type === "deleted") {
                cache.removeHandle(change.handlePath);
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
