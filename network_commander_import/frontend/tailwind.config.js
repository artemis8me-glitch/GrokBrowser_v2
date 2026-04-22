/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3b82f6",
                secondary: "#1e293b",
                accent: "#8b5cf6",
                dark: "#0f172a",
                darker: "#020617",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'spin-slow': 'spin 10s linear infinite',
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
