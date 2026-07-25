/**
 * rsvelte VS Code extension — a thin client that launches
 * `@rsvelte/language-server` over stdio and wires it to Svelte (and the
 * JS/TS/CSS/JSON families rsvelte-fmt can format).
 */

import * as path from "node:path";
import {
  IndentAction,
  extensions,
  languages,
  window,
  type ExtensionContext,
} from "vscode";
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

export function activate(context: ExtensionContext): void {
  registerSvelteLanguageConfiguration(context);
  void warnAboutOfficialExtension(context);

  // The bundled server lives at dist/server.mjs, copied next to the extension
  // bundle by the build (see build.mjs).
  const serverModule = context.asAbsolutePath(
    path.join("dist", "server.mjs"),
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
