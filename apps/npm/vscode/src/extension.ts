/**
 * rsvelte VS Code extension — a thin client that launches
 * `@rsvelte/language-server` over stdio and wires it to Svelte (and the
 * JS/TS/CSS/JSON families rsvelte-fmt can format).
 */

import * as path from "node:path";
import type { ExtensionContext } from "vscode";
import {
  LanguageClient,
  TransportKind,
  type LanguageClientOptions,
  type ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

/** Languages the server attaches to (formatting + diagnostics). */
const DOCUMENT_SELECTOR = [
  { scheme: "file", language: "svelte" },
  { scheme: "file", language: "typescript" },
  { scheme: "file", language: "javascript" },
  { scheme: "file", language: "typescriptreact" },
  { scheme: "file", language: "javascriptreact" },
  { scheme: "file", language: "json" },
  { scheme: "file", language: "jsonc" },
  { scheme: "file", language: "css" },
  { scheme: "file", language: "scss" },
  { scheme: "file", language: "less" },
];

export function activate(context: ExtensionContext): void {
  // The bundled server lives at dist/server.js, copied next to the extension
  // bundle by the build (see build.mjs).
  const serverModule = context.asAbsolutePath(
    path.join("dist", "server.js"),
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: DOCUMENT_SELECTOR,
    synchronize: {
      // Forward `rsvelte.*` configuration changes to the server.
      configurationSection: "rsvelte",
    },
  };

  client = new LanguageClient(
    "rsvelte",
    "rsvelte Language Server",
    serverOptions,
    clientOptions,
  );

  void client.start();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
