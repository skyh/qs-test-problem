import React, {FC} from "react";

import {AppDocument} from "../../../AppDocument";

interface Props {
    document: AppDocument
}

export const Document: FC<Props> = (props) => (
    <div>
        {props.document}
    </div>
);
