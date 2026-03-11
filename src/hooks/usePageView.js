import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function usePageView() {
    const location = useLocation();
    const sentRef = useRef(new Set());

    useEffect(() => {
        if (!window.gtag) return;
        const path = location.pathname + location.search;

        if (sentRef.current.has(path)) return;
        sentRef.current.add(path);

        window.gtag("event", "page_view", {
            page_path: path,
            page_location: window.location.href,
            page_title: document.title,
        });
    }, [location]);
}