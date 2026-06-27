/**
 * `@rsvelte/language-server` — a thin LSP server exposing rsvelte's formatter
 * and linter to any LSP client (VS Code, Neovim, …).
 *
 * v1 scope: document formatting (native `rsvelte-fmt`) + push diagnostics
 * (bundled `rsvelte_lint` wasm). Type-checking is intentionally out of scope
 * (see docs/vscode-extension-plan.md).
 */

import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
  type InitializeParams,
  type InitializeResult,
  type TextEdit,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { lintJsonToDiagnostics } from "./diagnostics.js";
import { formatWithRsvelteFmt, resolveRsvelteFmt } from "./format.js";
import { lintVersion, runLint } from "./lint.js";

interface RsvelteSettings {
  format: { enable: boolean };
  lint: { enable: boolean };
  rsvelteFmtPath: string;
}

const DEFAULT_SETTINGS: RsvelteSettings = {
  format: { enable: true },
  lint: { enable: true },
  rsvelteFmtPath: "",
};

const LINT_DEBOUNCE_MS = 300;

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

let settings: RsvelteSettings = DEFAULT_SETTINGS;
let hasConfigurationCapability = false;

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Whether a document should be linted (svelte components + `.svelte.js/ts`). */
function isLintTarget(doc: TextDocument): boolean {
  if (doc.languageId === "svelte") return true;
  return /\.svelte\.(js|ts)$/.test(doc.uri);
}

/** Best-effort filesystem path for a document URI (falls back to the URI). */
function docFsPath(uri: string): string {
  if (uri.startsWith("file://")) {
    try {
      return fileURLToPath(uri);
    } catch {
      /* fall through */
    }
  }
  return uri;
}

connection.onInitialize((params: InitializeParams): InitializeResult => {
  hasConfigurationCapability = Boolean(
    params.capabilities.workspace?.configuration,
  );
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      documentFormattingProvider: true,
    },
    serverInfo: {
      name: "rsvelte-language-server",
      version: lintVersion() ?? "unknown",
    },
  };
});

connection.onInitialized(async () => {
  await refreshSettings();
});

/** Pull `rsvelte.*` settings from the client when it supports configuration. */
async function refreshSettings(): Promise<void> {
  if (!hasConfigurationCapability) {
    settings = DEFAULT_SETTINGS;
    return;
  }
  try {
    const config = await connection.workspace.getConfiguration("rsvelte");
    settings = {
      format: { enable: config?.format?.enable ?? true },
      lint: { enable: config?.lint?.enable ?? true },
      rsvelteFmtPath:
        typeof config?.rsvelteFmtPath === "string" ? config.rsvelteFmtPath : "",
    };
  } catch {
    settings = DEFAULT_SETTINGS;
  }
}

connection.onDidChangeConfiguration(async () => {
  await refreshSettings();
  // Re-lint every open document under the new settings.
  for (const doc of documents.all()) {
    scheduleLint(doc, 0);
  }
});

// ── Formatting ──────────────────────────────────────────────────────────────

connection.onDocumentFormatting(async (params): Promise<TextEdit[]> => {
  if (!settings.format.enable) return [];
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];

  const fsPath = docFsPath(doc.uri);
  const binPath = resolveRsvelteFmt(
    dirname(fsPath),
    settings.rsvelteFmtPath,
  );
  if (!binPath) return [];

  const original = doc.getText();
  const formatted = await formatWithRsvelteFmt(binPath, original, fsPath);
  if (formatted === null || formatted === original) return [];

  // Replace the whole document.
  const fullRange = {
    start: { line: 0, character: 0 },
    end: doc.positionAt(original.length),
  };
  return [{ range: fullRange, newText: formatted }];
});

// ── Diagnostics ─────────────────────────────────────────────────────────────

function scheduleLint(doc: TextDocument, delay = LINT_DEBOUNCE_MS): void {
  const existing = debounceTimers.get(doc.uri);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    debounceTimers.delete(doc.uri);
    void lintDocument(doc);
  }, delay);
  debounceTimers.set(doc.uri, timer);
}

async function lintDocument(doc: TextDocument): Promise<void> {
  if (!settings.lint.enable || !isLintTarget(doc)) {
    connection.sendDiagnostics({ uri: doc.uri, diagnostics: [] });
    return;
  }
  const json = runLint(doc.getText(), docFsPath(doc.uri));
  const diagnostics = json ? lintJsonToDiagnostics(json) : [];
  connection.sendDiagnostics({ uri: doc.uri, diagnostics });
}

documents.onDidOpen((e) => scheduleLint(e.document, 0));
documents.onDidChangeContent((e) => scheduleLint(e.document));
documents.onDidSave((e) => scheduleLint(e.document, 0));

documents.onDidClose((e) => {
  const timer = debounceTimers.get(e.document.uri);
  if (timer) {
    clearTimeout(timer);
    debounceTimers.delete(e.document.uri);
  }
  // Clear diagnostics for the closed document.
  connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
});

documents.listen(connection);
connection.listen();
