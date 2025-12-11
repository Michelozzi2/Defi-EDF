/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                edf: {
                    blue: '#001A70',
                    orange: '#FE5815',
                    green: '#509E2F',
                }
            }
        },
    },
    plugins: [],
}
