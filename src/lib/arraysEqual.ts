export function arraysEqual<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>): boolean {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
