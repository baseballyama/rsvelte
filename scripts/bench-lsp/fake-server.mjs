#!/usr/bin/env node

let buffer = Buffer.alloc(0);
const end = Buffer.from("\r\n\r\n");

function send(message) {
  const body = Buffer.from(JSON.stringify(message));
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

function handle(message) {
  if (process.argv.includes("--hang-all")) return;
  if (message.method === "initialize") {
    send({
      jsonrpc: "2.0",
      id: message.id,
      result: {
        capabilities: { hoverProvider: true, completionProvider: {} },
        serverInfo: { name: "bench-fake", version: "1.0.0" },
      },
    });
  } else if (
    message.method === "textDocument/didOpen" &&
    !process.argv.includes("--no-diagnostics")
  ) {
    send({
      jsonrpc: "2.0",
      method: "textDocument/publishDiagnostics",
      params: { uri: message.params.textDocument.uri, diagnostics: [] },
    });
  } else if (message.method === "textDocument/hover") {
    send({ jsonrpc: "2.0", id: message.id, result: { contents: "hover" } });
  } else if (message.method === "textDocument/completion") {
    send({
      jsonrpc: "2.0",
      id: message.id,
      result: { isIncomplete: false, items: [] },
    });
  } else if (message.method === "shutdown") {
    send({ jsonrpc: "2.0", id: message.id, result: null });
  } else if (message.method === "exit") {
    process.exit(0);
  }
}

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf(end);
    if (headerEnd === -1) return;
    const header = buffer.subarray(0, headerEnd).toString("ascii");
    const length = Number(/Content-Length:\s*(\d+)/i.exec(header)?.[1]);
    const bodyStart = headerEnd + end.length;
    if (!Number.isFinite(length) || buffer.length < bodyStart + length) return;
    const body = buffer.subarray(bodyStart, bodyStart + length);
    buffer = buffer.subarray(bodyStart + length);
    handle(JSON.parse(body));
  }
});
