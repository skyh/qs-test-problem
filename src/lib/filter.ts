export function *filter<T>(input: IterableIterator<T>, predicate: (item: T) => void | boolean): IterableIterator<T> {
    for (const item of input) {
        if (predicate(item)) yield item;
    }
}
