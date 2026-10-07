/** @type {import('tailwindcss').Config} */
const scale = (name: string) => ({
  50: `oklch(var(--${name}-50) / <alpha-value>)`,
  100: `oklch(var(--${name}-100) / <alpha-value>)`,
  200: `oklch(var(--${name}-200) / <alpha-value>)`,
  300: `oklch(var(--${name}-300) / <alpha-value>)`,
  400: `oklch(var(--${name}-400) / <alpha-value>)`,
  500: `oklch(var(--${name}-500) / <alpha-value>)`,
  600: `oklch(var(--${name}-600) / <alpha-value>)`,
  700: `oklch(var(--${name}-700) / <alpha-value>)`,
  800: `oklch(var(--${name}-800) / <alpha-value>)`,
  900: `oklch(var(--${name}-900) / <alpha-value>)`,
  950: `oklch(var(--${name}-950) / <alpha-value>)`,
});

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: scale("background"),
        primary: scale("primary"),
        accent: scale("accent"),
        secondary: scale("secondary"),
        foreground: scale("foreground"),
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        body: ["var(--font-body)"],
        heading: ["var(--font-heading)"],
        display: ["var(--font-heading)"],
        serif: ["var(--font-heading)"],
        label: ["var(--font-label)"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px oklch(var(--foreground-950) / 0.18)",
        card: "0 6px 20px -10px oklch(var(--foreground-950) / 0.22)",
      },
    },
  },
  plugins: [],
};