const lightTheme = {
    "--color-dark-light": "#f0eeee",
    "--color-dark": "#fff",
    "--color-dark-dark": "#ccc",
    "--color-grey-light-1": "rgb(59, 58, 58)",
    "--color-green-light": "#28b485",
    "--color-grey-light-3": "#0d1723",
    "--color-background-white": "rgba(0,0,0,0.5)",
    "--color-grey-light-2": "#fffdfd"
};
const darkTheme = {
    "--color-dark-light": "#142437",
    "--color-dark": "#101d2c",
    "--color-dark-dark": "#0d1723",
    "--color-grey-light-1": "#f7f7f7",
    "--color-green-light": "#7ed56f",
    "--color-grey-light-3": "#f0eeee",
    "--color-background-white": "rgba(255,255,255,0.8)",
    "--color-grey-light-2": "#f4f2f2"
};

const applyTheme = nextTheme => {
    const theme = nextTheme === "dark" ? lightTheme : darkTheme;
    Object.keys(theme).map(key => {
      const value = theme[key];
      document.documentElement.style.setProperty(key, value);
    });
};

export default applyTheme