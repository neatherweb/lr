import { useState, useEffect } from 'preact/hooks';

export const useDocumentVisible = () => {
    const [documentVisible, setDocumentVisible] = useState(
        document.visibilityState
    );

    useEffect(() => {
        const handleVisibilityChange = () =>
            setDocumentVisible(document.visibilityState);

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () =>
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
    }, [document]);

    return documentVisible === 'visible';
};
