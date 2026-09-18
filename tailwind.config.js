/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // <-- Ditambahkan agar folder components ikut terpindai Tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
