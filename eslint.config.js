export default [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                CustomEvent: 'readonly',
                localStorage: 'readonly',
                JSON: 'readonly',
                Math: 'readonly',
                Date: 'readonly',
                Array: 'readonly',
                Object: 'readonly',
                String: 'readonly',
                Number: 'readonly',
                RegExp: 'readonly',
                Error: 'readonly',
                Promise: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                // Service Worker globals
                caches: 'readonly',
                self: 'readonly',
                // Node globals
                process: 'readonly',
                URL: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            eqeqeq: 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-duplicate-imports': 'error',
        },
    },
];
