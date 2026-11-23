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
	const diagnostics = await until('rsvelte diagnostics', () => {
		const found = vscode.languages.getDiagnostics(lint.uri).filter((d) => d.source === 'rsvelte');
		return found.length > 0 ? found : undefined;
	});
	const shown = diagnostics
		.map((d) => `${d.range.start.line + 1}:${d.range.start.character + 1} ${String(d.code)}`)
		.toSorted();
	// As `rsvelte lint` prints them; the emoji counts two UTF-16 units.
	assert.deepEqual(shown, [
		'2:7 no-unused-vars',
		'4:11 svelte/no-useless-mustaches',
		'4:4 svelte/no-useless-mustaches',
		'5:1 svelte/button-has-type',
	]);

	const whole = new vscode.Range(0, 0, lint.lineCount, 0);
	const quick = await vscode.commands.executeCommand<vscode.CodeAction[]>(
		'vscode.executeCodeActionProvider',
		lint.uri,
		whole,
		vscode.CodeActionKind.QuickFix.value,
	);
	const titles = quick.filter((a) => a.title.includes('no-useless-mustaches')).map((a) => a.title);
	assert.deepEqual(titles, [
		'Fix this svelte/no-useless-mustaches problem',
		'Fix this svelte/no-useless-mustaches problem',
	]);
	const all = await vscode.commands.executeCommand<vscode.CodeAction[]>(
		'vscode.executeCodeActionProvider',
		lint.uri,
		whole,
		'source.fixAll.rsvelte',
	);
	const fixAll = all.find((a) => a.kind?.value === 'source.fixAll.rsvelte');
	assert.ok(fixAll?.edit, 'a fix of every problem');
	await apply(lint, fixAll.edit);
	assert.equal(
		lint.getText(),
		'<script>\n  let unused = 1;\n</script>\n<p>😀 x</p>\n<button>b</button>\n',
	);
	// The fixed text, unsaved, is what the server lints next.
	await until('the diagnostics of the fixed text', () => {
		const left = vscode.languages.getDiagnostics(lint.uri).filter((d) => d.source === 'rsvelte');
		return left.length === 2 ? left : undefined;
	});

	const format = await open('src/Format.svelte');
	const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
		'vscode.executeFormatDocumentProvider',
		format.uri,
		{ tabSize: 2, insertSpaces: true },
	);
	await apply(format, edits);
	assert.equal(format.getText(), '<script>\n  let a = 1;\n</script>\n\n<p class="x">{a}</p>\n');
}
