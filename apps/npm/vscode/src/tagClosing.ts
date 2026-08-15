import {
  Disposable,
  Position,
  SnippetString,
  window,
  workspace,
  type TextDocument,
  type TextDocumentContentChangeEvent,
} from "vscode";

export function activateTagClosing(
  request: (document: TextDocument, position: Position) => Thenable<string>,
): Disposable {
  const subscriptions: Disposable[] = [];
  let enabled = false;
  let timer: NodeJS.Timeout | undefined;

  const updateEnabled = () => {
    const document = window.activeTextEditor?.document;
    enabled = Boolean(
      document?.languageId === "svelte" &&
      workspace
        .getConfiguration(undefined, document.uri)
        .get<boolean>("html.autoClosingTags", true),
    );
  };

  const changed = (document: TextDocument, changes: readonly TextDocumentContentChangeEvent[]) => {
    if (!enabled || document !== window.activeTextEditor?.document || !changes.length) {
      return;
    }
    clearTimeout(timer);
    const change = changes.at(-1)!;
    const last = change.text.at(-1);
    if ((change.rangeLength ?? 0) > 0 || (last !== ">" && last !== "/")) return;

    const position = change.range.start.translate(0, change.text.length);
    const version = document.version;
    timer = setTimeout(async () => {
      const text = await request(document, position);
      const editor = window.activeTextEditor;
      if (!text || !enabled || editor?.document !== document || document.version !== version) {
        return;
      }
      const cursors = editor.selections
        .filter((selection) => selection.active.isEqual(position))
        .map((selection) => selection.active);
      await editor.insertSnippet(new SnippetString(text), cursors.length ? cursors : position);
    }, 100);
  };

  subscriptions.push(
    workspace.onDidChangeTextDocument((event) => changed(event.document, event.contentChanges)),
    window.onDidChangeActiveTextEditor(updateEnabled),
  );
  updateEnabled();
  return new Disposable(() => {
    clearTimeout(timer);
    subscriptions.forEach((subscription) => subscription.dispose());
  });
}
