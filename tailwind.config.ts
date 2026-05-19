import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#001F3F",
          50: "#e6edf5",
          100: "#ccdaeb",
          200: "#99b5d7",
          300: "#6690c3",
          400: "#336baf",
          500: "#001F3F",
          600: "#001a36",
          700: "#00152c",
          800: "#000f21",
          900: "#000a16",
        },
        orange: {
          DEFAULT: "#FFA500",
          50: "#fff8e6",
          100: "#fff1cc",
          200: "#ffe399",
          300: "#ffd466",
          400: "#ffc633",
          500: "#FFA500",
          600: "#cc8400",
          700: "#996300",
          800: "#664200",
          900: "#332100",
        },
      },
    },
  },
  plugins: [],
};
export default config;
