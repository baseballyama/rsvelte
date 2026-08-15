import { execFile, execFileSync, spawn } from "node:child_process";
import process from "node:process";

const HEADER_END = Buffer.from("\r\n\r\n");

function withTimeout(promise, timeoutMs, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    }),
  ]).finally(() => clearTimeout(timer));
}

function descendantsRss(rootPid) {
  if (process.platform === "win32") return Promise.resolve(null);
  return new Promise((resolve) => {
    execFile(
      "ps",
      ["-axo", "pid=,ppid=,rss="],
      { encoding: "utf8" },
      (error, stdout) => {
        if (error) return resolve(null);
        const rows = stdout
          .trim()
          .split("\n")
          .map((line) => line.trim().split(/\s+/).map(Number))
          .filter(
            ([pid, ppid, rss]) =>
              Number.isFinite(pid) &&
              Number.isFinite(ppid) &&
              Number.isFinite(rss),
          );
        const children = new Map();
        for (const [pid, ppid] of rows) {
          const list = children.get(ppid) ?? [];
          list.push(pid);
          children.set(ppid, list);
        }
        const wanted = new Set([rootPid]);
        const queue = [rootPid];
        while (queue.length > 0) {
          for (const pid of children.get(queue.pop()) ?? []) {
            if (wanted.has(pid)) continue;
            wanted.add(pid);
            queue.push(pid);
          }
        }
        resolve(
          rows.reduce(
            (total, [pid, , rss]) => total + (wanted.has(pid) ? rss : 0),
            0,
          ),
        );
      },
    );
  });
}

export class LspProcess {
  #buffer = Buffer.alloc(0);
  #child;
  #closed;
  #nextId = 0;
  #notifications = [];
  #pending = new Map();
  #stderr = "";
  #waiters = [];
  #memoryTimer;
  #peakRssKb = null;
  #sampleInFlight = null;
  #spawned;

  constructor(command, { cwd, env = {}, timeoutMs }) {
    this.command = command;
    this.timeoutMs = timeoutMs;
    this.#child = spawn(command[0], command.slice(1), {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["pipe", "pipe", "pipe"],
      detached: process.platform !== "win32",
      windowsHide: true,
    });
    this.#closed = new Promise((resolve) => {
      let settled = false;
      const settle = (value) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      this.#child.once("exit", (code, signal) => settle({ code, signal }));
      this.#child.once("error", (error) =>
        settle({ code: null, signal: null, error: error.message }),
      );
    });
    this.#spawned = new Promise((resolve, reject) => {
      this.#child.once("spawn", resolve);
      this.#child.once("error", reject);
    });
    this.#child.once("error", (error) => this.#rejectAll(error));
    this.#child.stdout.on("data", (chunk) => {
      try {
        this.#read(chunk);
      } catch (error) {
        this.#rejectAll(error);
        void this.kill();
      }
    });
    this.#child.stderr.on("data", (chunk) => {
      this.#stderr = `${this.#stderr}${chunk}`.slice(-64 * 1024);
    });
    this.#memoryTimer = setInterval(() => this.#sampleMemory(), 25);
    this.#memoryTimer.unref();
    this.#sampleMemory();
  }

  get pid() {
    return this.#child.pid;
  }

  get stderr() {
    return this.#stderr;
  }

  async memory() {
    await this.#sampleMemory();
    const rssKb = await descendantsRss(this.#child.pid);
    if (rssKb !== null) this.#peakRssKb = Math.max(this.#peakRssKb ?? 0, rssKb);
    return {
      rssKb,
      peakRssKb: this.#peakRssKb,
      includesDescendants: process.platform !== "win32",
    };
  }

  #sampleMemory() {
    if (this.#sampleInFlight) return this.#sampleInFlight;
    this.#sampleInFlight = descendantsRss(this.#child.pid)
      .then((rss) => {
        if (rss !== null) this.#peakRssKb = Math.max(this.#peakRssKb ?? 0, rss);
      })
      .finally(() => {
        this.#sampleInFlight = null;
      });
    return this.#sampleInFlight;
  }

  #read(chunk) {
    this.#buffer = Buffer.concat([this.#buffer, chunk]);
    while (true) {
      const headerEnd = this.#buffer.indexOf(HEADER_END);
      if (headerEnd === -1) return;
      const header = this.#buffer.subarray(0, headerEnd).toString("ascii");
      const match = /(?:^|\r\n)Content-Length:\s*(\d+)/i.exec(header);
      if (!match)
        throw new Error(`missing Content-Length from ${this.command[0]}`);
      const length = Number(match[1]);
      const bodyStart = headerEnd + HEADER_END.length;
      if (this.#buffer.length < bodyStart + length) return;
      const body = this.#buffer.subarray(bodyStart, bodyStart + length);
      this.#buffer = this.#buffer.subarray(bodyStart + length);
      this.#message(JSON.parse(body.toString("utf8")));
    }
  }

  #message(message) {
    if (Object.hasOwn(message, "id") && !message.method) {
      const pending = this.#pending.get(String(message.id));
      if (!pending) return;
      this.#pending.delete(String(message.id));
      if (message.error)
        pending.reject(new Error(JSON.stringify(message.error)));
      else pending.resolve(message.result);
      return;
    }
    if (Object.hasOwn(message, "id") && message.method) {
      this.#answerServerRequest(message);
      return;
    }
    this.#notifications.push(message);
    for (const waiter of [...this.#waiters]) {
      if (!waiter.predicate(message)) continue;
      this.#waiters.splice(this.#waiters.indexOf(waiter), 1);
      waiter.resolve(message);
    }
  }

  #answerServerRequest(message) {
    let result = null;
    if (message.method === "workspace/configuration") {
      result = (message.params?.items ?? []).map(() => null);
    } else if (message.method === "workspace/applyEdit") {
      result = { applied: true };
    }
    this.send({ jsonrpc: "2.0", id: message.id, result });
  }

  #rejectAll(error) {
    for (const pending of this.#pending.values()) pending.reject(error);
    this.#pending.clear();
    for (const waiter of this.#waiters) waiter.reject(error);
    this.#waiters.length = 0;
  }

  send(message) {
    const body = Buffer.from(JSON.stringify(message));
    this.#child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
    this.#child.stdin.write(body);
  }

  notify(method, params) {
    this.send({ jsonrpc: "2.0", method, params });
  }

  request(method, params, timeoutMs = this.timeoutMs) {
    const id = ++this.#nextId;
    const response = new Promise((resolve, reject) => {
      this.#pending.set(String(id), { resolve, reject });
    });
    this.send({ jsonrpc: "2.0", id, method, params });
    return withTimeout(
      response,
      timeoutMs,
      `${method} (${this.command[0]})`,
    ).finally(() => {
      this.#pending.delete(String(id));
    });
  }

  waitNotification(predicate, timeoutMs = this.timeoutMs) {
    const queued = this.#notifications.find(predicate);
    if (queued) {
      this.#notifications.splice(this.#notifications.indexOf(queued), 1);
      return Promise.resolve(queued);
    }
    let waiter;
    const notification = new Promise((resolve, reject) => {
      waiter = { predicate, resolve, reject };
      this.#waiters.push(waiter);
    });
    return withTimeout(
      notification,
      timeoutMs,
      `notification (${this.command[0]})`,
    ).finally(() => {
      const index = this.#waiters.indexOf(waiter);
      if (index !== -1) this.#waiters.splice(index, 1);
    });
  }

  async close() {
    clearInterval(this.#memoryTimer);
    try {
      await this.request("shutdown", null, Math.min(this.timeoutMs, 2_000));
      this.notify("exit", null);
      this.#child.stdin.end();
      return await withTimeout(this.#closed, 2_000, "language-server exit");
    } catch {
      await this.kill();
      return await this.#closed;
    }
  }

  async kill() {
    clearInterval(this.#memoryTimer);
    if (this.#child.exitCode !== null || this.#child.signalCode !== null)
      return;
    if (process.platform === "win32") {
      try {
        execFileSync(
          "taskkill",
          ["/pid", String(this.#child.pid), "/t", "/f"],
          {
            stdio: "ignore",
          },
        );
      } catch {}
    } else {
      try {
        process.kill(-this.#child.pid, "SIGTERM");
      } catch {}
    }
    await Promise.race([
      this.#closed,
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
    if (this.#child.exitCode === null && this.#child.signalCode === null) {
      try {
        process.kill(-this.#child.pid, "SIGKILL");
      } catch {}
    }
  }

  async started() {
    await Promise.race([
      this.#spawned,
      this.#closed.then(({ code, signal }) => {
        throw new Error(
          `server exited before spawn completed: ${code ?? signal}\n${this.#stderr}`,
        );
      }),
    ]);
  }
}
