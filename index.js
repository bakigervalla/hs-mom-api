const path = require("path");

require("dotenv").config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV == "production"
      ? "./.env.production"
      : "./.env.development"
  ),
});

const swaggerUi = require("swagger-ui-express"),
      swaggerFile = require("./swagger_output.json"),
      app = require("./server/server"),
      config = require("./server/config");

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, {
    explorer: true,
    // customCssUrl:
    //   "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
  })
);

app.get("/", (req, res) => res.sendFile(path.join(__dirname, '/index.html')));

// Start listening
app.listen(config.port, () => {
  console.log(`Sever started http://${process.env.DB_HOST}:%s`, config.port);
});
