/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          app: "var(--bg-app)",
          surface: "var(--bg-surface)",
          soft: "var(--bg-surface-soft)",
          muted: "var(--bg-surface-muted)",
          hover: "var(--bg-surface-hover)",
        },
        navy: {
          950: "var(--navy-950)",
          900: "var(--navy-900)",
          850: "var(--navy-850)",
          800: "var(--navy-800)",
          100: "var(--navy-100)",
          50: "var(--navy-50)",
        },
        brand: {
          amber: "var(--amber-gold)",
          amberLight: "var(--amber-light)",
          borderSubtle: "var(--border-subtle)",
          borderMedium: "var(--border-medium)",
        },
        status: {
          paid: "var(--status-paid)",
          paidBg: "var(--status-paid-bg)",
          unpaid: "var(--status-unpaid)",
          unpaidBg: "var(--status-unpaid-bg)",
          partial: "var(--status-partial)",
          partialBg: "var(--status-partial-bg)",
          overdue: "var(--status-overdue)",
        }
      },
      fontFamily: {
        sans: ["var(--font-baloo)", "'Baloo Bhai 2'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        routeEnter: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        routeEnter: "routeEnter 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
