import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';
import { router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Function to sync CSRF token to meta tag
function syncCsrfToken() {
    // Try to get from Inertia page props first
    const page = (window as any).Inertia?.page;
    const csrfToken = page?.props?.csrfToken;
    
    if (csrfToken) {
        let meta = document.head.querySelector('meta[name="csrf-token"]');
        if (meta) {
            meta.setAttribute('content', csrfToken);
        } else {
            // Create meta tag if it doesn't exist
            meta = document.createElement('meta');
            meta.setAttribute('name', 'csrf-token');
            meta.setAttribute('content', csrfToken);
            document.head.appendChild(meta);
        }
        return true;
    }
    return false;
}

// Sync CSRF token immediately when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // First use token from window if available (from blade template)
        if ((window as any).__csrfToken) {
            const meta = document.head.querySelector('meta[name="csrf-token"]');
            if (meta) {
                meta.setAttribute('content', (window as any).__csrfToken);
            }
        }
        syncCsrfToken();
    });
} else {
    // Use token from window if available
    if ((window as any).__csrfToken) {
        const meta = document.head.querySelector('meta[name="csrf-token"]');
        if (meta) {
            meta.setAttribute('content', (window as any).__csrfToken);
        }
    }
    syncCsrfToken();
}

// Sync CSRF token to meta tag after each visit to ensure it's always up-to-date
router.on('start', () => {
    // Ensure we have CSRF token before request
    syncCsrfToken();
});

router.on('finish', () => {
    // Update CSRF token after response
    syncCsrfToken();
});

router.on('error', () => {
    // Re-sync on error in case token was regenerated
    setTimeout(syncCsrfToken, 100);
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Priority order: window.__csrfToken (from blade) > Inertia props > meta tag
        let csrfToken = (window as any).__csrfToken;
        
        if (!csrfToken) {
            csrfToken = (props.initialPage?.props as any)?.csrfToken;
        }

        // Ensure CSRF token is set in meta tag
        if (csrfToken) {
            let meta = document.head.querySelector('meta[name="csrf-token"]');
            if (meta) {
                meta.setAttribute('content', csrfToken);
            } else {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'csrf-token');
                meta.setAttribute('content', csrfToken);
                document.head.insertBefore(meta, document.head.firstChild);
            }
            // Update window for consistency
            (window as any).__csrfToken = csrfToken;
        } else {
            // If no token found, try to get from meta tag
            const meta = document.head.querySelector('meta[name="csrf-token"]');
            if (meta) {
                csrfToken = meta.getAttribute('content') || '';
                if (csrfToken) {
                    (window as any).__csrfToken = csrfToken;
                }
            }
        }

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-right" richColors />
            </>
        );

        // Sync again after render to ensure it's set and up-to-date
        syncCsrfToken();
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
