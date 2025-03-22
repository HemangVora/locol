/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1", // indigo-500
          50: "#eef2ff", // indigo-50
          100: "#e0e7ff", // indigo-100
          200: "#c7d2fe", // indigo-200
          300: "#a5b4fc", // indigo-300
          400: "#818cf8", // indigo-400
          500: "#6366f1", // indigo-500
          600: "#4f46e5", // indigo-600
          700: "#4338ca", // indigo-700
          800: "#3730a3", // indigo-800
          900: "#312e81", // indigo-900
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
