const path = require("node:path");
const { spawn } = require("node:child_process");

const mode = process.argv[2] || "dev";
const nextBin = require.resolve("next/dist/bin/next");
const workerBin = path.join(__dirname, "naver-mail-worker.js");

function spawnNodeProcess(args) {
  return spawn(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
}

const nextProcess = spawnNodeProcess([nextBin, mode]);
const workerProcess = spawnNodeProcess([workerBin]);

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (!nextProcess.killed) {
    nextProcess.kill("SIGINT");
  }

  if (!workerProcess.killed) {
    workerProcess.kill("SIGINT");
  }

  process.exit(code);
}

nextProcess.on("exit", (code) => {
  shutdown(code ?? 0);
});

workerProcess.on("exit", (code) => {
  if (code && code !== 0) {
    shutdown(code);
  }
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
