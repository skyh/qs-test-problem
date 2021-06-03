import React, {FC} from "react";

import {AddedNode, CacheNode, HandleNode, MissingNode} from "../../../../lib/StoragePartialView";
import {HOCProps} from "../HOCProps";
import {CreateAddedNodeRow} from "./AddedNodeRow";
import {CreateHandleNodeRow} from "./HandleNodeRow";
import {CreateMissingNodeRow} from "./MissingNodeRow";
import {RowProps} from "../RowProps";

export const CreateRow = <Document extends any>(hocProps: HOCProps<Document>) => {
    const HandleNodeRow = CreateHandleNodeRow(hocProps);
    const MissingNodeRow = CreateMissingNodeRow(hocProps);
    const AddedNodeRow = CreateAddedNodeRow(hocProps);

    const Row: FC<RowProps<CacheNode<Document> | AddedNode<Document>>> = (props) => {
        const {node} = props;

        if (node instanceof HandleNode) {
            return <HandleNodeRow {...props} node={node} />;
        }

        if (node instanceof MissingNode) {
            return <MissingNodeRow {...props} node={node} />;
        }

        if (node instanceof AddedNode) {
            return <AddedNodeRow {...props} node={node} />;
        }

        throw new Error("Unsupported node type")
    };

    return Row;
}
