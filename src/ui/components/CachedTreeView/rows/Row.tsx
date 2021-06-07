import React, {FC} from "react";
import {db} from "../../../../lib/db";

import {HOCProps} from "../HOCProps";
import {CreateAddedNodeRow} from "./AddedNodeRow";
import {CreateHandleNodeRow} from "./HandleNodeRow";
import {CreateMissingNodeRow} from "./MissingNodeRow";
import {RowProps} from "../RowProps";

export const CreateRow = <Document extends any>(hocProps: HOCProps<Document>) => {
    const HandleNodeRow = CreateHandleNodeRow(hocProps);
    const MissingNodeRow = CreateMissingNodeRow(hocProps);
    const AddedNodeRow = CreateAddedNodeRow(hocProps);

    const Row: FC<RowProps<db.cache.AnyNode<Document>>> = (props) => {
        const {node} = props;

        if (node.type === "HANDLE") {
            return <HandleNodeRow {...props} node={node} />;
        }

        if (node.type === "MISSING") {
            return <MissingNodeRow {...props} node={node} />;
        }

        if (node.type === "ADDED") {
            return <AddedNodeRow {...props} node={node} />;
        }

        throw new Error("Unsupported node type");
    };

    return Row;
}
