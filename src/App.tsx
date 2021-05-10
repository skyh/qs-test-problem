import React, {FC, Fragment} from 'react';

import styles from './App.module.sass';
import {ThreeColLayout} from "./ThreeColLayout";

export const App: FC = () => (
    <div className={styles.App}>
        <h1>Cached Tree View Problem</h1>
        <ThreeColLayout>
            <Fragment>
                DB view
            </Fragment>
            <Fragment>
                Cache view
            </Fragment>
            <Fragment>
                controls
            </Fragment>
        </ThreeColLayout>
    </div>
);
