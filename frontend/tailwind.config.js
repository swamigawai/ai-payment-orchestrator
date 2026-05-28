/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          "surface-alt": "var(--color-surface-alt)",
          text: "var(--color-text)",
          "text-muted": "var(--color-text-muted)",
          primary: "var(--color-primary)",
          "primary-dark": "var(--color-primary-dark)",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
          info: "var(--color-info)"
        }
      },
      animation: {
        "cell-ripple": "cell-ripple var(--duration, 2s) var(--delay, 0s) ease-in-out",
      },
      keyframes: {
        "cell-ripple": {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { opacity: "0.4" },
        },
      }
    },
  },
  plugins: [],
}
