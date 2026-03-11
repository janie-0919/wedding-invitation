export function gaEvent(name, params = {}) {
    if (!window.gtag) return;
    window.gtag('event', name, {
        event_category: 'engagement',
        ...params,
    });
}