import { MutableRef, useEffect } from 'preact/hooks';

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
