import { spawn } from "node:child_process";

let stopping = false;

const child = spawn(process.execPath, ["x", "vite"], {
  stdio: "inherit",
  env: process.env,
  windowsHide: false,
});

const shutdown = () => {
  if (stopping) return;
  stopping = true;

  try {
    child.kill("SIGINT");
  } catch {
    // 이미 종료된 경우 무시
  }
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

child.once("exit", (code, signal) => {
  if (stopping || signal === "SIGINT" || signal === "SIGTERM") {
    process.exit(0);
  }

  process.exit(code ?? 1);
});
