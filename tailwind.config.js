/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        primary: "var(--primary-text)",
        secondary: "var(--secondary-text)",
        button: "var(--button)",
        highlight: "var(--highlight)",
      },
    },
  },
  plugins: [],
};
