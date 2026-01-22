/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f43f5e', // rose-500
          hover: '#e11d48',   // rose-600
          active: '#be123c',  // rose-700
          light: '#fdf2f8',   // rose-50
        },
      },
    },
  },
  plugins: [],
}
