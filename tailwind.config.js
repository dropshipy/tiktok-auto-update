require("dotenv").config();

const colors = {
  tiksender: {
    primary: "#6ACAD0",
    secondary: "#ED2053",
    gradient: "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)",
  },
  supportseller: {
    primary: "#60BB55",
    secondary: "#60BB55",
    gradient: "linear-gradient(315.05deg, #B6EEAF 16.34%, #F0FEEE 98.18%)",
  },
};

const getColor = (color) => {
  return colors[process.env.APP_NAME][color] || colors.tiksender[color];
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{vue,js}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: getColor("primary"),
        secondary: getColor("secondary"),
        dark: "#474747",
        dark2: "#2D2D2D",
        dark3: "#66738F",
        light: "#EEEDFA",
        blue: "#5FB6E5",
        green: "#0AA723",
        green2: "#25D366",
        success: "#08A081",
        error: "#EE3331",
        yellow: "#FF9D45",
      },
      boxShadow: {
        sidebar: "0px 2px 12px 0px #4338C91A",
        navbar: "0px 2px 20px 0px #4338C91A",
        card: "0px 2px 12px 0px rgba(241, 239, 246, 0.25)",
      },
      backgroundImage: {
        "login-gradient": getColor("gradient"),
      },
      fontFamily: {
        dm: ["DM Sans", "sans-serif"],
        nunito: ["Nunito Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
