/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                cyan: {
                    primary: '#00FFD1',
                },
                amber: {
                    accent: '#FFB347',
                },
                dark: {
                    bg: '#0A0A0F',
                    card: '#111118',
                    border: '#1e1e2e',
                },
            },
            fontFamily: {
                syne: ['Syne', 'sans-serif'],
                mono: ['"Space Mono"', 'monospace'],
            },
        },
    },
    plugins: [],
};
