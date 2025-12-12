/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                edf: {
                    blue: '#001A70',
                    orange: '#FE5815',
                    green: '#509E2F',
                    red: '#EF4444',
                    violet: '#8B5CF6',
                }
            }
        },
    },
    plugins: [],
}
