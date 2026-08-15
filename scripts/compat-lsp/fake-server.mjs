import { spawn } from "node:child_process";

let buffer = Buffer.alloc(0);
const open = new Set();
const unresponsive = process.argv.includes("--unresponsive");
if (unresponsive) {
  const grandchild = spawn(
    process.execPath,
    ["-e", "setInterval(() => {}, 1000)"],
    {
      stdio: "ignore",
    },
  );
  process.stderr.write(`grandchild:${grandchild.pid}\n`);
}

function send(message) {
  const body = Buffer.from(JSON.stringify(message));
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

function dispatch(message) {
  if (unresponsive) return;
  if (message.method === "textDocument/didOpen") {
    open.add(message.params.textDocument.uri);
  } else if (message.method === "shutdown") {
    send({ jsonrpc: "2.0", id: message.id, result: null });
  } else if (message.method === "exit") {
    process.exit(0);
  } else if (message.id !== undefined) {
    send({
      jsonrpc: "2.0",
      id: message.id,
      result: {
        opened: open.has(message.params.textDocument.uri),
        sequence: message.params.sequence,
      },
    });
  }
}

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  for (;;) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd < 0) return;
    const match = /Content-Length:\s*(\d+)/i.exec(
      buffer.subarray(0, headerEnd).toString("ascii"),
    );
    const length = Number(match[1]);
    const start = headerEnd + 4;
    if (buffer.length < start + length) return;
    const message = JSON.parse(
      buffer.subarray(start, start + length).toString("utf8"),
    );
    buffer = buffer.subarray(start + length);
    dispatch(message);
  }
});
