import {AppDocument} from "../AppDocument";

interface Props {
    document: AppDocument
    onEdited: (document: AppDocument) => void
}

export const DocumentEditor = (props: Props) => {
    return (
        <div>
            Document editor stub
        </div>
    );
}
