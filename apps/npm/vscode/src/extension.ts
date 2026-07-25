/**
 * rsvelte VS Code extension — a thin client that launches
 * `@rsvelte/language-server` over stdio and wires it to Svelte (and the
 * JS/TS/CSS/JSON families rsvelte-fmt can format).
 */

import * as path from "node:path";
import {
  IndentAction,
  commands,
  extensions,
  languages,
  window,
  workspace,
  type ExtensionContext,
  type LogOutputChannel,
  type TextDocument,
} from "vscode";
import {
  LanguageClient,
  State,
  Trace,
  TransportKind,
  type LanguageClientOptions,
  type ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;
let outputChannel: LogOutputChannel | undefined;
let restarting = false;

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

/** HTML elements that never get a closing tag, so they must not trigger indent. */
const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const OFFICIAL_EXTENSION_ID = "svelte.svelte-vscode";
const CONFLICT_DISMISSED_KEY = "rsvelte.officialExtensionConflictDismissed";
const RESTART_COMMAND_ID = "rsvelte.restartLanguageServer";

/**
 * Basenames of files whose content changes the server's effective
 * compiler/format/lint config, matched against the extensions rsvelte
 * actually resolves (see `crates/rsvelte_core/src/svelte_check/config.rs`,
 * `crates/rsvelte_fmt/src/config.rs`, `crates/rsvelte_lint/src/main.rs`).
 */
const RESTART_ON_SAVE_PATTERNS: readonly RegExp[] = [
  /^svelte\.config\.(js|mjs|cjs|ts|mts)$/,
  /^vite\.config\.(js|mjs|cjs|ts|mts|cts)$/,
  /^rsvelte-lint\.json$/,
  /^\.rsvelte-lintrc\.json$/,
  /^\.oxfmtrc\.(json|jsonc)$/,
  /^oxfmt\.config\.(ts|mts)$/,
];

function registerSvelteLanguageConfiguration(context: ExtensionContext): void {
  const voidElements = VOID_ELEMENTS.join("|");
  context.subscriptions.push(
    languages.setLanguageConfiguration("svelte", {
      indentationRules: {
        // An opening tag that is not a doctype, void element, closing tag, or
        // self-closed, and is not closed again on the same line — or `<!--`, or `{`.
        increaseIndentPattern:
          /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
        // A leading closing tag other than `</html>`, or `-->`, or `}`.
        decreaseIndentPattern: /^\s*(<\/(?!html)[-_.A-Za-z0-9]+\b[^>]*>|-->|\})/,
      },
      // A number with an optional sign/fraction, or a run of characters
      // excluding whitespace and punctuation that cannot appear in an identifier.
      wordPattern:
        /(-?\d*\.\d\w*)|([^\`\~\!\@\#\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
      onEnterRules: [
        {
          beforeText: new RegExp(
            `<(?!(?:${voidElements}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
            "i",
          ),
          afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
          action: { indentAction: IndentAction.IndentOutdent },
        },
        {
          beforeText: new RegExp(
            `<(?!(?:${voidElements}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
            "i",
          ),
          action: { indentAction: IndentAction.Indent },
        },
      ],
    }),
  );
}

/**
 * Both extensions contribute the `source.svelte` grammar and register
 * providers for the `svelte` language, so running them together duplicates
 * every feature and makes which grammar wins depend on activation order.
 */
async function warnAboutOfficialExtension(
  context: ExtensionContext,
): Promise<void> {
  if (context.globalState.get<boolean>(CONFLICT_DISMISSED_KEY)) return;
  if (!extensions.getExtension(OFFICIAL_EXTENSION_ID)) return;

  const dismiss = "Don't show again";
  const choice = await window.showWarningMessage(
    "rsvelte and the official Svelte extension (svelte.svelte-vscode) are both enabled. " +
      "They contribute the same Svelte grammar and overlapping diagnostics, and both register " +
      "providers for Svelte files — expect duplicate problems, duplicate completions and hovers, " +
      "and a formatter-picker prompt on every format. Disable one of them.",
    dismiss,
  );
  if (choice === dismiss) {
    await context.globalState.update(CONFLICT_DISMISSED_KEY, true);
  }
}

/** Resolves once `c` has left the `Starting` state, so `stop`/`restart` never race an in-flight `start`. */
function waitWhileStarting(c: LanguageClient): Promise<void> {
  if (c.state !== State.Starting) return Promise.resolve();
  return new Promise((resolve) => {
    const disposable = c.onDidChangeState((event) => {
      if (event.newState !== State.Starting) {
        disposable.dispose();
        resolve();
      }
    });
  });
}

/**
 * Restarts the running client, or starts it if it never came up (e.g. a
 * previous `StartFailed`). `BaseLanguageClient.restart()` calls `stop()`
 * first, which throws unless the client is `Running`, so those states go
 * through `start()` instead. The `restarting` guard collapses concurrent
 * triggers (command + several config saves in a row) into one restart.
 */
async function restartLanguageServer(): Promise<void> {
  if (!client || restarting) return;
  restarting = true;
  try {
    await waitWhileStarting(client);
    outputChannel?.clear();
    if (client.state === State.Running) {
      await client.restart();
    } else {
      await client.start();
    }
    if (client.state === State.Running) {
      await client.setTrace(traceFromConfig());
    }
  } finally {
    restarting = false;
  }
}

function traceFromConfig(): Trace {
  const value = workspace
    .getConfiguration("rsvelte")
    .get<string>("trace.server", "off");
  return Trace.fromString(value ?? "off");
}

/** Resolves a config value that may be relative to the first workspace folder. */
function resolveWorkspaceRelative(configured: string): string {
  if (path.isAbsolute(configured)) return configured;
  const root = workspace.workspaceFolders?.[0]?.uri.fsPath;
  return root ? path.join(root, configured) : configured;
}

function resolveServerModule(context: ExtensionContext): string {
  const configured = workspace
    .getConfiguration("rsvelte")
    .get<string>("languageServer.path");
  if (configured && configured.trim() !== "") {
    return resolveWorkspaceRelative(configured);
  }
  // The bundled server lives at dist/server.mjs, copied next to the
  // extension bundle by the build (see build.mjs).
  return context.asAbsolutePath(path.join("dist", "server.mjs"));
}

/** Files outside any open workspace folder, or inside `node_modules`, never trigger a restart. */
function isRestartTrigger(document: TextDocument): boolean {
  if (document.uri.scheme !== "file") return false;
  if (!workspace.getWorkspaceFolder(document.uri)) return false;

  const relativeParts = workspace
    .asRelativePath(document.uri, false)
    .split(/[\\/]/);
  if (relativeParts.includes("node_modules")) return false;

  const base = path.basename(document.uri.fsPath);
  return RESTART_ON_SAVE_PATTERNS.some((pattern) => pattern.test(base));
}

export function activate(context: ExtensionContext): void {
  registerSvelteLanguageConfiguration(context);
  void warnAboutOfficialExtension(context);

  const serverModule = resolveServerModule(context);

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  outputChannel = window.createOutputChannel("rsvelte Language Server", {
    log: true,
  });
  context.subscriptions.push(outputChannel);

  const clientOptions: LanguageClientOptions = {
    documentSelector: DOCUMENT_SELECTOR,
    outputChannel,
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

  void client
    .start()
    .then(() => client?.setTrace(traceFromConfig()))
    // The client already surfaces start failures via its own error UI.
    .catch(() => undefined);

  context.subscriptions.push(
    commands.registerCommand(RESTART_COMMAND_ID, () =>
      restartLanguageServer(),
    ),
    workspace.onDidSaveTextDocument((document) => {
      if (isRestartTrigger(document)) {
        void restartLanguageServer();
      }
    }),
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("rsvelte.trace.server")) {
        void client?.setTrace(traceFromConfig());
      }
    }),
  );
}

export async function deactivate(): Promise<void> {
  const toStop = client;
  client = undefined;
  outputChannel = undefined;
  if (!toStop) return;
  // Mirrors the restart guard: `stop()` throws unless the client is
  // `Running`, so wait out an in-flight `start()` before stopping.
  await waitWhileStarting(toStop);
  if (toStop.state === State.Running) {
    await toStop.stop();
  }
}
