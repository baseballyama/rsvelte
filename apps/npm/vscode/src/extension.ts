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
let extensionContext: ExtensionContext | undefined;
let restarting = false;
let deactivated = false;

/** How long a restart waits for a hung `initialize` before giving up and forcing a new instance/process. */
const RESTART_WAIT_TIMEOUT_MS = 10_000;

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
 * actually resolves (see `crates/rsvelte_check/src/svelte_check/config.rs`,
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

/**
 * Resolves once `c` has left the `Starting` state — so `stop`/`dispose`
 * never race an in-flight `start` — or after `timeoutMs`, whichever comes
 * first. `vscode-languageclient`'s `initialize()` has no timeout of its own,
 * so a server that hangs before responding would otherwise leave `c` stuck
 * in `Starting` forever and this would never resolve. The boolean tells the
 * caller which happened.
 */
function waitWhileStarting(
  c: LanguageClient,
  timeoutMs: number,
): Promise<{ timedOut: boolean }> {
  if (c.state !== State.Starting) return Promise.resolve({ timedOut: false });
  return new Promise((resolve) => {
    let settled = false;
    const disposable = c.onDidChangeState((event) => {
      if (settled || event.newState === State.Starting) return;
      settled = true;
      clearTimeout(timer);
      disposable.dispose();
      resolve({ timedOut: false });
    });
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      disposable.dispose();
      resolve({ timedOut: true });
    }, timeoutMs);
  });
}

function buildServerOptions(context: ExtensionContext): ServerOptions {
  const serverModule = resolveServerModule(context);
  return {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };
}

/** Builds a fresh, unstarted client. Called on every (re)start so a changed `rsvelte.languageServer.path` takes effect. */
function createClient(
  context: ExtensionContext,
  channel: LogOutputChannel,
): LanguageClient {
  const clientOptions: LanguageClientOptions = {
    documentSelector: DOCUMENT_SELECTOR,
    outputChannel: channel,
    synchronize: {
      // Forward `rsvelte.*` configuration changes to the server.
      configurationSection: "rsvelte",
    },
  };
  return new LanguageClient(
    "rsvelte",
    "rsvelte Language Server",
    buildServerOptions(context),
    clientOptions,
  );
}

/**
 * Creates and starts a new client, assigning it to the module-level `client`.
 * Used both for the initial activation and after `restartLanguageServer`
 * discards the previous instance.
 */
async function startClient(
  context: ExtensionContext,
  channel: LogOutputChannel,
): Promise<void> {
  const next = createClient(context, channel);
  client = next;
  try {
    await next.start();
  } catch {
    // The client already surfaces start failures via its own error UI;
    // `client` stays assigned to `next` (now `StartFailed`) so a later
    // restart discards it and spins up a fresh instance/process — retrying
    // `start()` on the same instance would just return the old rejection
    // (vscode-languageclient@10.1.0 never clears `_onStart` on StartFailed).
  }
  if (deactivated) {
    // `deactivate()` ran while we were starting — don't leave an orphaned
    // client running past it.
    if (client === next) client = undefined;
    await next.dispose().catch(() => undefined);
    return;
  }
  if (client === next && next.state === State.Running) {
    await next.setTrace(traceFromConfig());
  }
}

/**
 * Replaces the client with a brand-new instance and process rather than
 * reusing `restart()`/`start()` on the same one, for two reasons:
 *  - a `StartFailed` instance can never recover via `start()` (see
 *    `startClient`), so restarting after a failed launch needs a new
 *    instance regardless;
 *  - `rsvelte.languageServer.path` is only read when building `ServerOptions`
 *    (`buildServerOptions`), so reusing the instance would silently keep
 *    running the old path after the setting changes.
 * The `restarting` guard collapses concurrent triggers (the command plus
 * several config saves in a row) into one restart. Module state (`client`,
 * `outputChannel`, `extensionContext`) is captured into locals up front so a
 * concurrent `deactivate()` clearing those globals mid-restart can't turn an
 * await-resumed access into a `TypeError`.
 */
async function restartLanguageServer(): Promise<void> {
  const context = extensionContext;
  const channel = outputChannel;
  const previous = client;
  if (!context || !channel || !previous || restarting) return;

  restarting = true;
  try {
    const { timedOut } = await waitWhileStarting(
      previous,
      RESTART_WAIT_TIMEOUT_MS,
    );
    if (timedOut) {
      void window.showWarningMessage(
        "rsvelte: the language server did not respond to initialize within " +
          `${RESTART_WAIT_TIMEOUT_MS / 1000}s — restarting anyway.`,
      );
    }

    channel.clear();
    if (client === previous) client = undefined;
    try {
      // Rejects when `previous` never reached `Running` (StartFailed, or
      // still Starting after the timeout above) — the underlying process is
      // still reaped asynchronously by LanguageClient's own
      // `checkProcessDied`, so it's safe to ignore and move on.
      await previous.dispose();
    } catch {
      // Expected in the states described above.
    }

    if (deactivated) return;
    await startClient(context, channel);
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

  extensionContext = context;
  deactivated = false;

  const channel = window.createOutputChannel("rsvelte Language Server", {
    log: true,
  });
  outputChannel = channel;
  context.subscriptions.push(channel);

  void startClient(context, channel);

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
      if (event.affectsConfiguration("rsvelte.trace.server") && client) {
        void client.setTrace(traceFromConfig());
      }
    }),
  );
}

export async function deactivate(): Promise<void> {
  deactivated = true;
  const toStop = client;
  client = undefined;
  outputChannel = undefined;
  extensionContext = undefined;
  if (!toStop) return;
  // Mirrors the restart guard: `dispose()`/`stop()` throws unless the client
  // is `Running`, so wait out an in-flight `start()` (bounded, in case it's
  // hung) before disposing, and ignore the rejection for any state that
  // slips through anyway (e.g. `StartFailed`).
  await waitWhileStarting(toStop, RESTART_WAIT_TIMEOUT_MS);
  await toStop.dispose().catch(() => undefined);
}
