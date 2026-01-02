import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";

export type SpawnCliOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  input?: string;
  scriptPath?: string;
};

export type SpawnCliResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export async function spawnCli(args: string[], options: SpawnCliOptions = {}): Promise<SpawnCliResult> {
  const scriptPath = options.scriptPath ?? path.join(process.cwd(), "dist/cli/index.js");
  const proc = spawn(process.execPath, [scriptPath, ...args], {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
  });

  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  proc.stdout?.on("data", (chunk) => stdoutChunks.push(Buffer.from(chunk)));
  proc.stderr?.on("data", (chunk) => stderrChunks.push(Buffer.from(chunk)));

  if (options.input) {
    proc.stdin?.write(options.input);
    proc.stdin?.end();
  }

  const [exitCode] = (await once(proc, "exit")) as [number];

  return {
    stdout: Buffer.concat(stdoutChunks).toString(),
    stderr: Buffer.concat(stderrChunks).toString(),
    exitCode: exitCode ?? 0,
  };
}
