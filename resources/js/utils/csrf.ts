import { usePage } from '@inertiajs/react';

/**
 * Get CSRF token from Inertia page props or fallback to meta tag
 * This ensures we always have the latest CSRF token even after navigation
 */
export function getCsrfToken(): string {
    try {
        // Try to get from Inertia page props first (always up-to-date)
        const page = (window as any).Inertia?.page;
        if (page?.props?.csrfToken) {
            // Also sync to meta tag for consistency
            const meta = document.head.querySelector('meta[name="csrf-token"]');
            if (meta && meta.getAttribute('content') !== page.props.csrfToken) {
                meta.setAttribute('content', page.props.csrfToken);
            }
            return page.props.csrfToken;
        }

        // Fallback to meta tag
        const meta = document.head.querySelector('meta[name="csrf-token"]');
        if (meta) {
            const token = meta.getAttribute('content') || '';
            if (token) {
                return token;
            }
        }
    } catch (error) {
        console.warn('Failed to get CSRF token from Inertia props:', error);
    }

    // Final fallback to meta tag
    const meta = document.head.querySelector('meta[name="csrf-token"]');
    const token = meta?.getAttribute('content') || '';
    
    // If no token found, try to get from XSRF-TOKEN cookie (Laravel default)
    if (!token) {
        const cookies = document.cookie.split(';');
        const xsrfCookie = cookies.find(c => c.trim().startsWith('XSRF-TOKEN='));
        if (xsrfCookie) {
            return decodeURIComponent(xsrfCookie.split('=')[1]);
        }
    }
    
    return token;
}

/**
 * Hook to get CSRF token in React components
 */
export function useCsrfToken(): string {
    const { csrfToken } = usePage().props as { csrfToken?: string };
    
    // Return from props if available, otherwise get from meta tag
    if (csrfToken) {
        return csrfToken;
    }
    
    return getCsrfToken();
}

