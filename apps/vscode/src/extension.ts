// Starts `rsvelte lsp` for each workspace folder that installs @rsvelte/cli, so each folder is
// served by its own version of rsvelte, in that folder, as its commands run there.
import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { outermost } from './folders.ts';
import { findProgram } from './program.ts';
import { typescriptArguments, type Setting } from './typescript.ts';

/** The languages `rsvelte lsp` lints and formats. */
const LANGUAGES = ['svelte', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact'];

let output: vscode.LogOutputChannel;
let clients: LanguageClient[] = [];
/** Starts and stops one after another, however fast the events that ask for them come. */
let queue = Promise.resolve();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
	output = vscode.window.createOutputChannel('rsvelte', { log: true });
	context.subscriptions.push(
		output,
		vscode.commands.registerCommand('rsvelte.restartServer', restart),
		vscode.commands.registerCommand('rsvelte.showOutputChannel', () => output.show()),
		vscode.workspace.onDidChangeWorkspaceFolders(restart),
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (
				event.affectsConfiguration('rsvelte.enable') ||
				event.affectsConfiguration('rsvelte.path') ||
				event.affectsConfiguration('rsvelte.typescript')
			)
				void restart();
		}),
	);
	await restart();
}

export function deactivate(): Promise<void> {
	return (queue = queue.then(stop));
}

function restart(): Promise<void> {
	queue = queue
		.then(async () => {
			await stop();
			return start();
		})
		// A failed start must not stop every later one.
		.catch((error: unknown) => output.error(`rsvelte did not start: ${String(error)}`));
	return queue;
}

async function stop(): Promise<void> {
	const stopping = clients;
	clients = [];
	await Promise.all(stopping.map((client) => client.stop().catch(() => undefined)));
}

async function start(): Promise<void> {
	const folders = (vscode.workspace.workspaceFolders ?? []).filter((f) => f.uri.scheme === 'file');
	const programs = await Promise.all(folders.map(programOf));
	const served = folders.flatMap((folder, i) => {
		const program = programs[i];
		return program === undefined ? [] : [{ folder, program }];
	});
	// A folder inside another served one is served by the outer folder's server, never by two.
	const started = await Promise.all(outermost(served, (s) => s.folder.uri.fsPath).map(serve));
	clients = started.filter((client) => client !== undefined);
}

/** The running client of `folder`'s server, or `undefined` when it does not start. */
async function serve({
	folder,
	program,
}: {
	folder: vscode.WorkspaceFolder;
	program: string;
}): Promise<LanguageClient | undefined> {
	const setting = vscode.workspace
		.getConfiguration('rsvelte', folder)
		.get<Setting>('typescript', 'auto');
	const svelte = vscode.extensions.getExtension('svelte.svelte-vscode') !== undefined;
	const client = new LanguageClient(
		'rsvelte',
		`rsvelte (${folder.name})`,
		{
			command: program,
			args: ['lsp', ...typescriptArguments(setting, svelte)],
			options: { cwd: folder.uri.fsPath },
		},
		{
			documentSelector: LANGUAGES.map((language) => ({
				scheme: 'file',
				language,
				pattern: { baseUri: folder.uri.toString(), pattern: '**/*' },
			})),
			workspaceFolder: folder,
			outputChannel: output,
		},
	);
	try {
		await client.start();
		output.info(`${folder.name}: serving with ${program}`);
		return client;
	} catch (error) {
		output.error(`${folder.name}: ${program} lsp did not start: ${String(error)}`);
		return undefined;
	}
}

/** The program that serves `folder`, or `undefined`, said in the output, when none does. */
async function programOf(folder: vscode.WorkspaceFolder): Promise<string | undefined> {
	if (!vscode.workspace.getConfiguration('rsvelte', folder).get<boolean>('enable', true))
		return undefined;
	const configured = vscode.workspace.getConfiguration('rsvelte').get<string>('path', '');
	if (configured !== '') return configured;
	const found = await findProgram(folder.uri.fsPath);
	if (found === undefined) {
		output.info(`${folder.name}: @rsvelte/cli is not installed, so rsvelte does not run`);
		return undefined;
	}
	if ('problem' in found) {
		output.warn(`${folder.name}: ${found.problem}`);
		void vscode.window.showWarningMessage(`rsvelte: ${found.problem}`);
		return undefined;
	}
	return found.program;
}
