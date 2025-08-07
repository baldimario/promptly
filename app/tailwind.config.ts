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
        background: {
          DEFAULT: "#161712",
          alt: "#1d2013",
        },
        primary: {
          DEFAULT: "#bada55", // Updated accent color
          dark: "#a8c34c",
        },
        secondary: {
          DEFAULT: "#34372a", // Dark green for secondary buttons
          alt: "#3d4328",
        },
        border: {
          DEFAULT: "#34372a", // Border color
          alt: "#576039",
        },
        text: {
          DEFAULT: "#FFFFFF", // Main text color
          muted: "#b1b6a0", // Muted text color
          alt: "#b9c398", // Alternative muted text
        },
        input: {
          DEFAULT: "#34372a", // Input background
          alt: "#2c301c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
