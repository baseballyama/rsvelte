/* oxlint-disable no-await-in-loop -- A wait asks again only after the last answer. */
// What VS Code shows and does with the extension running, as an editor user meets it.
import assert from 'node:assert/strict';
import * as vscode from 'vscode';

const PATIENCE_MS = 60_000;

/** The first value `probe` gives that is not `undefined`, asked again until the patience ends. */
async function until<T>(
	what: string,
	probe: () => T | undefined | Promise<T | undefined>,
): Promise<T> {
	const end = Date.now() + PATIENCE_MS;
	while (Date.now() < end) {
		const value = await probe();
		if (value !== undefined) return value;
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	throw new Error(`no ${what} within ${PATIENCE_MS} ms`);
}

async function open(name: string): Promise<vscode.TextDocument> {
	const folder = vscode.workspace.workspaceFolders?.[0];
	assert.ok(folder, 'the workspace is open');
	const document = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(folder.uri, name));
	await vscode.window.showTextDocument(document);
	return document;
}

async function apply(
	document: vscode.TextDocument,
	edits: vscode.TextEdit[] | vscode.WorkspaceEdit,
) {
	const edit = edits instanceof vscode.WorkspaceEdit ? edits : new vscode.WorkspaceEdit();
	if (Array.isArray(edits)) edit.set(document.uri, edits);
	assert.ok(await vscode.workspace.applyEdit(edit));
}

export async function run(): Promise<void> {
	const lint = await open('src/Lint.svelte');
	assert.equal(lint.languageId, 'svelte');
	const diagnostics = await until('lint diagnostics', () => {
		const found = vscode.languages.getDiagnostics(lint.uri).filter((d) => d.source === 'oxc');
		return found.length > 0 ? found : undefined;
	});
	const shown = diagnostics
		.map((d) => `${d.range.start.line + 1}:${d.range.start.character + 1} ${String(d.code)}`)
		.toSorted();
	// As `rsvelte lint` prints them; the emoji counts two UTF-16 units.
	assert.deepEqual(shown, [
		'2:7 eslint(no-unused-vars)',
		'4:11 svelte(no-useless-mustaches)',
		'4:4 svelte(no-useless-mustaches)',
		'5:1 svelte(button-has-type)',
	]);

	const whole = new vscode.Range(0, 0, lint.lineCount, 0);
	const quick = await vscode.commands.executeCommand<vscode.CodeAction[]>(
		'vscode.executeCodeActionProvider',
		lint.uri,
		whole,
		vscode.CodeActionKind.QuickFix.value,
	);
	assert.ok(quick.filter((a) => a.isPreferred).length >= 2, quick.map((a) => a.title).join('\n'));
	const all = await vscode.commands.executeCommand<vscode.CodeAction[]>(
		'vscode.executeCodeActionProvider',
		lint.uri,
		whole,
		'source.fixAll.oxc',
	);
	const fixAll = all.find((a) => a.kind?.value === 'source.fixAll.oxc');
	assert.ok(fixAll?.edit, 'a fix of every problem');
	await apply(lint, fixAll.edit);
	assert.equal(
		lint.getText(),
		'<script>\n  let unused = 1;\n</script>\n<p>😀 x</p>\n<button>b</button>\n',
	);
	// The fixed text, unsaved, is what the server lints next.
	await until('the diagnostics of the fixed text', () => {
		const left = vscode.languages.getDiagnostics(lint.uri).filter((d) => d.source === 'oxc');
		return left.length === 2 ? left : undefined;
	});

	const typed = await open('src/Typed.svelte');
	const typeErrors = () =>
		vscode.languages
			.getDiagnostics(typed.uri)
			.filter((d) => d.source === 'ts')
			.map((d) => `${d.range.start.line + 1}:${d.range.start.character + 1} ${String(d.code)}`);
	// As `rsvelte typecheck` prints it.
	assert.deepEqual(
		await until('type errors', () => (typeErrors().length > 0 ? typeErrors() : undefined)),
		['2:8 2322'],
	);
	const literal = typed.getText().indexOf("'x'");
	const fixed = new vscode.Range(typed.positionAt(literal), typed.positionAt(literal + 3));
	await apply(typed, [vscode.TextEdit.replace(fixed, '1')]);
	// The unsaved text is what the type check reads next.
	await until('no type errors', () => (typeErrors().length === 0 ? true : undefined));

	const format = await open('src/Format.svelte');
	const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
		'vscode.executeFormatDocumentProvider',
		format.uri,
		{ tabSize: 2, insertSpaces: true },
	);
	await apply(format, edits);
	assert.equal(format.getText(), '<script>\n  let a = 1;\n</script>\n\n<p class="x">{a}</p>\n');
}
