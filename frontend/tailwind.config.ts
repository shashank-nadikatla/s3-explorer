import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          container: "var(--primary-container)",
        },
        "on-primary-container": "var(--on-primary-container)",
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          container: "var(--secondary-container)",
        },
        "on-secondary-container": "var(--on-secondary-container)",
        tertiary: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--tertiary-foreground)",
          container: "var(--tertiary-container)",
        },
        "on-tertiary-container": "var(--on-tertiary-container)",
        error: {
          DEFAULT: "var(--error)",
          container: "var(--error-container)",
        },
        "on-error-container": "var(--on-error-container)",
        surface: {
          DEFAULT: "var(--surface)",
          dim: "var(--surface-dim)",
          bright: "var(--surface-bright)",
          variant: "var(--surface-variant)",
          "container-lowest": "var(--surface-container-lowest)",
          "container-low": "var(--surface-container-low)",
          container: "var(--surface-container)",
          "container-high": "var(--surface-container-high)",
          "container-highest": "var(--surface-container-highest)",
        },
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "inverse-surface": "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
        muted: {
          DEFAULT: "var(--surface-variant)",
          foreground: "var(--on-surface-variant)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        "2xl": "36px",
      },
      boxShadow: {
        "elev-1": "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 1px rgb(0 0 0 / 0.04)",
        "elev-2": "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 2px 6px 2px rgb(0 0 0 / 0.06)",
        "elev-3": "0 4px 8px 3px rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.08)",
        "elev-4": "0 6px 10px 4px rgb(0 0 0 / 0.07), 0 2px 3px 0 rgb(0 0 0 / 0.1)",
        "elev-5": "0 8px 12px 6px rgb(0 0 0 / 0.08), 0 4px 4px 0 rgb(0 0 0 / 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
