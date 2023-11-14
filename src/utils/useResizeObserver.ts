import { MutableRef, useEffect } from 'preact/hooks';

/**
 * Creates a new {@link https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver|ResizeObserver}
 * for the given `ref` and calls the `callback` function every time the `ref`'s dimensions change.
 */
export const useResizeObserver = (
    ref: MutableRef<Element | null>,
    callback: () => void
) => {
    useEffect(() => {
        if (ref.current) {
            const observer = new ResizeObserver(callback);
            observer.observe(ref.current);
            return () => observer.disconnect();
        }
    }, [callback]);
};
