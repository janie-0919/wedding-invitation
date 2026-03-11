import { useState, useEffect } from 'react';

const useImageLoader = (imageUrls) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let loadedCount = 0;

        const handleLoad = () => {
            loadedCount += 1;
            if (isMounted && loadedCount === imageUrls.length) {
                setLoaded(true);
            }
        };

        const handleError = () => {
            window.location.replace('/404.html');
        };

        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = handleLoad;
            img.onerror = handleError;
            img.src = url;
        });

        return () => {
            isMounted = false;
        };
    }, [imageUrls]);

    return { loaded };
};

export default useImageLoader;