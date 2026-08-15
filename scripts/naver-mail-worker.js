const path = require("node:path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
});

const workerModulePath = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "mail",
  "startNaverMailSyncWorker.ts"
);

const { startNaverMailSyncWorker } = require(workerModulePath);

startNaverMailSyncWorker();
