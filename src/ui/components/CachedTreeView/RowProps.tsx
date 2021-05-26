export interface RowProps<Node> {
    node: Node
    selected: boolean
    onSelect: (node: Node) => void
    onActivate: (node: Node) => void
}
