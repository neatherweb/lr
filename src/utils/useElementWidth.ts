import { ref, watch, type Ref } from 'vue';

export const useElementWidth = (
    elementRef: Ref<HTMLElement | undefined>
): Ref<number> => {
    const width = ref(0);

    let observer: ResizeObserver | null = null;

    function disconnect() {
        if (observer !== null) {
            observer.disconnect();
            observer = null;
        }
    }

    function connect(htmlElement: HTMLElement) {
        disconnect();
        observer = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect;
            if (rect) {
                width.value = rect.width;
            }
        });
        observer.observe(htmlElement);
    }

    watch(
        elementRef,
        (htmlElement) => {
            if (htmlElement !== undefined) {
                connect(htmlElement);
            } else {
                disconnect();
            }
        },
        { immediate: true }
    );

    return width;
};
