/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tw-elements/dist/plugin.cjs")],
  darkMode: "class",
};

// module.exports = {
//   content: [
//     "./index.html",
//     "./src/**/*.{html,js}",
//     "./node_modules/tw-elements/dist/js/**/*.js",
//   ],
//   plugins: [require("tw-elements/dist/plugin.cjs")],
//   darkMode: "class",
// };
