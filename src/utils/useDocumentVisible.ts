import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export const useDocumentVisible = (): Ref<boolean> => {
    const isDocumentVisible = ref(document.visibilityState === 'visible');

    const handleVisibilityChange = () =>
        (isDocumentVisible.value = document.visibilityState === 'visible');

    onMounted(() => {
        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange,
            false
        );
    });

    onUnmounted(() => {
        document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
        );
    });

    return isDocumentVisible;
};
