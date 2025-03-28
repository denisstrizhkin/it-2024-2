import babel from "@rollup/plugin-babel";
const pages = ["index.js", "login.js"];

const pluginList = [babel({ babelHelpers: "bundled" })];
const export_page = pages.reduce((acc, item) => {
  acc.push({
    input: `./src/${item}`,
    output: {
      file: `../server/www/js/${item}`,
      format: "cjs",
      sourcemap: "inline",
    },
    plugins: pluginList,
  });
  return acc;
}, []);

export default export_page;
