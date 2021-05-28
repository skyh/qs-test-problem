import {ComponentType} from "react";

export interface HOCProps<Document> {
    /**
     * Component to render document
     */
    DocumentComponent: ComponentType<{
        document: Document
    }>

    /**
     * Component to edit document
     */
    DocumentEditorComponent: ComponentType<{
        document: Document
        onEdited(document: Document): void
    }>
}
