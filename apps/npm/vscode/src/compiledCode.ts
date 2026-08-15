import {
  Disposable,
  EventEmitter,
  ProgressLocation,
  Uri,
  ViewColumn,
  commands,
  window,
  workspace,
  type ExtensionContext,
  type TextDocumentContentProvider,
} from "vscode";
import { State, type LanguageClient } from "vscode-languageclient/node";

interface CompiledCodeResponse {
  js?: { code: string };
  css?: { code: string };
}

const jsUri = Uri.parse("svelte-compiled:///preview.js");
const cssUri = Uri.parse("svelte-compiled:///preview.css");

class CompiledCodeProvider extends Disposable implements TextDocumentContentProvider {
  private readonly changed = new EventEmitter<Uri>();
  private readonly subscriptions: Disposable[] = [];
  private selected?: string;
  private cached?: Promise<CompiledCodeResponse | null>;
  private timer?: NodeJS.Timeout;

  readonly onDidChange = this.changed.event;

  constructor(private readonly getClient: () => LanguageClient | undefined) {
    super(() => this.disposeAll());
    this.subscriptions.push(
      workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId !== "svelte" || !this.selected) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.refresh(), 500);
      }),
      window.onDidChangeActiveTextEditor((editor) => {
        if (editor?.document.languageId !== "svelte") return;
        const selected = editor.document.uri.toString();
        if (selected !== this.selected) {
          this.selected = selected;
          this.refresh();
        }
      }),
    );
  }

  async provideTextDocumentContent(uri: Uri): Promise<string | undefined> {
    this.selected ??=
      window.activeTextEditor?.document.languageId === "svelte"
        ? window.activeTextEditor.document.uri.toString()
        : undefined;
    if (!this.selected) return undefined;

    const client = this.getClient();
    if (!client || client.state !== State.Running) return undefined;
    this.cached ??= client.sendRequest<CompiledCodeResponse | null>(
      "$/getCompiledCode",
      this.selected,
    );
    const response = await this.cached;
    const source = Uri.parse(this.selected).fsPath;
    if (!response) {
      window.setStatusBarMessage(`rsvelte: failed to compile ${source}`, 3000);
      return undefined;
    }
    if (uri.path === jsUri.path) {
      return `/* Compiled: ${source} */\n${response.js?.code ?? ""}`;
    }
    if (uri.path === cssUri.path) {
      return `/* Compiled: ${source} */\n${response.css?.code ?? "/* No CSS output */"}`;
    }
    return undefined;
  }

  private refresh(): void {
    this.cached = undefined;
    this.changed.fire(jsUri);
    this.changed.fire(cssUri);
  }

  private disposeAll(): void {
    clearTimeout(this.timer);
    this.subscriptions.forEach((subscription) => subscription.dispose());
    this.changed.dispose();
  }
}

export function registerCompiledCode(
  context: ExtensionContext,
  getClient: () => LanguageClient | undefined,
): void {
  const provider = new CompiledCodeProvider(getClient);
  context.subscriptions.push(
    provider,
    workspace.registerTextDocumentContentProvider("svelte-compiled", provider),
    commands.registerTextEditorCommand("rsvelte.showCompiledCodeToSide", async (editor) => {
      if (editor.document.languageId !== "svelte") return;
      await window.withProgress(
        { location: ProgressLocation.Window, title: "Compiling Svelte..." },
        () =>
          window.showTextDocument(jsUri, {
            preview: true,
            viewColumn: ViewColumn.Beside,
          }),
      );
    }),
    commands.registerTextEditorCommand("rsvelte.showCompiledCSSToSide", async (editor) => {
      if (editor.document.languageId !== "svelte") return;
      await window.withProgress(
        { location: ProgressLocation.Window, title: "Compiling Svelte CSS..." },
        () =>
          window.showTextDocument(cssUri, {
            preview: true,
            viewColumn: ViewColumn.Beside,
          }),
      );
    }),
  );
}
