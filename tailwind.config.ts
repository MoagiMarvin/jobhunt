import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0F172A', // Slate 900
                secondary: '#D4AF37', // Gold
                accent: '#3B82F6', // Blue 500
            },
        },
    },
    plugins: [],
} satisfies Config;
