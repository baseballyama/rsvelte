// The official Svelte language server's plugins, called in this process on one document at a
// time. The package exports only its server, so its plugins load by their files.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const SOURCE = path.join(
	fs.realpathSync(path.resolve(import.meta.dirname, '../node_modules/svelte-language-server')),
	'dist/src',
);
const load = createRequire(import.meta.url);

/** A document of the server, which reads its HTML when it is opened. */
export interface ServerDocument {
	readonly brand: unique symbol;
}

interface FoldingRange {
	startLine: number;
	endLine: number;
	kind?: string;
}

interface Position {
	line: number;
	character: number;
}

interface HtmlSymbol {
	name: string;
	containerName: string;
	location: { range: { start: Position; end: Position } };
}

interface HtmlPlugin {
	getFoldingRanges(document: ServerDocument): FoldingRange[];
	getDocumentSymbols(document: ServerDocument): HtmlSymbol[];
}

interface Documents {
	openClientDocument(item: { uri: string; text: string }): ServerDocument;
	closeDocument(uri: string): void;
}

interface Modules {
	documents: Documents;
	html: HtmlPlugin;
}

let modules: Modules | undefined;

/** The server's plugins, set up as Visual Studio Code sets them up: it folds whole lines. */
function server(): Modules {
	if (modules) return modules;
	const { Document, DocumentManager } = load(path.join(SOURCE, 'lib/documents/index.js')) as {
		Document: new (url: string, text: string, skipConfigLoading: boolean) => ServerDocument;
		DocumentManager: new (
			create: (item: { uri: string; text: string }) => ServerDocument,
		) => Documents;
	};
	const { LSConfigManager } = load(path.join(SOURCE, 'ls-config.js')) as {
		LSConfigManager: new () => { updateClientCapabilities(capabilities: unknown): void };
	};
	const { HTMLPlugin } = load(path.join(SOURCE, 'plugins/html/HTMLPlugin.js')) as {
		HTMLPlugin: new (
			documents: Documents,
			config: unknown,
			files: undefined,
			folders: unknown[],
		) => HtmlPlugin;
	};
	const config = new LSConfigManager();
	config.updateClientCapabilities({ textDocument: { foldingRange: { lineFoldingOnly: true } } });
	// Without a Svelte configuration, which the server would look for beside the file.
	const documents = new DocumentManager((item) => new Document(item.uri, item.text, true));
	modules = { documents, html: new HTMLPlugin(documents, config, undefined, []) };
	return modules;
}

/** What `read` gets of the server's plugins on `text` opened at `filename`. */
export function withDocument<T>(
	filename: string,
	text: string,
	read: (html: HtmlPlugin, opened: ServerDocument) => T,
): T {
	const { documents, html } = server();
	const uri = `file:///${filename}`;
	const opened = documents.openClientDocument({ uri, text });
	try {
		return read(html, opened);
	} finally {
		documents.closeDocument(uri);
	}
}
