import {ComponentType} from "react";

export interface HOCProps<Document> {
    /**
     * Component to render node's document
     */
    DocumentComponent: ComponentType<{
        document: Document
    }>
}
