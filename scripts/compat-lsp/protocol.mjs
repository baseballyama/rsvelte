import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 180_000;

export class LspProcess {
  constructor(
    name,
    command,
    { cwd, env, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
  ) {
    this.name = name;
    this.timeoutMs = timeoutMs;
    this.pendingResponses = new Map();
    this.responseWaiters = new Map();
    this.pendingServerRequests = [];
    this.buffer = Buffer.alloc(0);
    this.stderr = "";
    this.child = spawn(command[0], command.slice(1), {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...env, NO_COLOR: "1" },
      detached: process.platform !== "win32",
    });
    this.child.stdout.on("data", (chunk) => this.#consume(chunk));
    this.child.stderr.on("data", (chunk) => {
      this.stderr = (this.stderr + chunk.toString("utf8")).slice(-16_384);
    });
    this.child.once("error", (error) => this.#failAll(error));
    this.child.once("exit", (code, signal) => {
      if (!this.closing) {
        this.#failAll(
          new Error(`${name} exited (${signal ?? code})\n${this.stderr}`),
        );
      }
    });
  }

  setClientRequestHandler(handler) {
    this.clientRequestHandler = handler;
    for (const message of this.pendingServerRequests.splice(0))
      this.#answerServerRequest(message);
  }

  send(message) {
    const body = Buffer.from(JSON.stringify(message));
    this.child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
    this.child.stdin.write(body);
  }

  response(id, clientRequestHandler, timeoutMs = this.timeoutMs) {
    if (clientRequestHandler)
      this.setClientRequestHandler(clientRequestHandler);
    if (this.pendingResponses.has(id)) {
      const message = this.pendingResponses.get(id);
      this.pendingResponses.delete(id);
      return Promise.resolve(message);
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.responseWaiters.delete(id);
        reject(
          new Error(
            `${this.name} produced no response to ${id} within ${timeoutMs}ms\n${this.stderr}`,
          ),
        );
      }, timeoutMs);
      this.responseWaiters.set(id, {
        resolve: (message) => {
          clearTimeout(timer);
          resolve(message);
        },
        reject,
        timer,
      });
    });
  }

  async shutdown(nextId, clientRequestHandler) {
    if (this.child.exitCode !== null) return;
    this.closing = true;
    try {
      this.send({
        jsonrpc: "2.0",
        id: nextId,
        method: "shutdown",
        params: null,
      });
      await this.response(
        nextId,
        clientRequestHandler,
        Math.min(1_000, this.timeoutMs),
      );
      this.send({ jsonrpc: "2.0", method: "exit", params: null });
      this.child.stdin.end();
      if (await this.#waitForExit(1_000)) return;
    } catch {
      this.child.stdin.destroy();
    }
    this.#killTree("SIGTERM");
    if (await this.#waitForExit(1_000)) return;
    this.#killTree("SIGKILL");
    if (!(await this.#waitForExit(1_000))) {
      throw new Error(`${this.name} process tree did not exit after SIGKILL`);
    }
  }

  #killTree(signal) {
    if (this.child.exitCode !== null) return;
    try {
      if (process.platform === "win32") this.child.kill(signal);
      else process.kill(-this.child.pid, signal);
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
  }

  #waitForExit(timeoutMs) {
    if (this.child.exitCode !== null) return Promise.resolve(true);
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.child.off("exit", exited);
        resolve(false);
      }, timeoutMs);
      const exited = () => {
        clearTimeout(timer);
        resolve(true);
      };
      this.child.once("exit", exited);
    });
  }

  #consume(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    for (;;) {
      const headerEnd = this.buffer.indexOf("\r\n\r\n");
      if (headerEnd < 0) return;
      const header = this.buffer.subarray(0, headerEnd).toString("ascii");
      const match = /(?:^|\r\n)Content-Length:\s*(\d+)/i.exec(header);
      if (!match) {
        this.#failAll(
          new Error(`${this.name} emitted an LSP frame without Content-Length`),
        );
        return;
      }
      const length = Number(match[1]);
      const bodyStart = headerEnd + 4;
      if (this.buffer.length < bodyStart + length) return;
      const body = this.buffer.subarray(bodyStart, bodyStart + length);
      this.buffer = this.buffer.subarray(bodyStart + length);
      try {
        this.#dispatch(JSON.parse(body.toString("utf8")));
      } catch (error) {
        this.#failAll(new Error(`${this.name} emitted invalid JSON: ${error}`));
        return;
      }
    }
  }

  #dispatch(message) {
    if (message.method) {
      if (message.id !== undefined) {
        if (this.clientRequestHandler) this.#answerServerRequest(message);
        else this.pendingServerRequests.push(message);
      }
      return;
    }
    const waiter = this.responseWaiters.get(message.id);
    if (waiter) {
      this.responseWaiters.delete(message.id);
      waiter.resolve(message);
    } else {
      this.pendingResponses.set(message.id, message);
    }
  }

  async #answerServerRequest(message) {
    try {
      const result = await this.clientRequestHandler(message);
      this.send({ jsonrpc: "2.0", id: message.id, result });
    } catch (error) {
      this.send({
        jsonrpc: "2.0",
        id: message.id,
        error: { code: -32603, message: String(error) },
      });
    }
  }

  #failAll(error) {
    for (const waiter of this.responseWaiters.values()) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.responseWaiters.clear();
  }
}

export function parseCommand(value, fallback) {
  if (!value) return fallback;
  let command;
  try {
    command = JSON.parse(value);
  } catch {
    throw new Error(
      'LSP command overrides must be JSON arrays, for example ["node","server.js","--stdio"]',
    );
  }
  if (
    !Array.isArray(command) ||
    command.length === 0 ||
    command.some((part) => typeof part !== "string")
  ) {
    throw new Error(
      "LSP command overrides must be non-empty JSON string arrays",
    );
  }
  return command;
}
