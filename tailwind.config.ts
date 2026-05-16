import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:            "var(--bg)",
        surface:       "var(--surface)",
        surface2:      "var(--surface2)",
        ink:           "var(--ink)",
        muted:         "var(--muted)",
        border:        "var(--border)",
        accent:        "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
        green:         "var(--green)",
        red:           "var(--red)",
      },
      fontFamily: {
        sans:     ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif:    ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        fraunces: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono:     ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      letterSpacing: {
        tighter: "-0.03em",
      },
    },
  },
  plugins: [],
};

export default config;
