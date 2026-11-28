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

/** A document of the server, which reads its HTML when it is created. */
export interface ServerDocument {
	readonly brand: unique symbol;
}

interface FoldingRange {
	startLine: number;
	endLine: number;
	kind?: string;
}

interface HtmlPlugin {
	getFoldingRanges(document: ServerDocument): FoldingRange[];
}

interface Modules {
	Document: new (url: string, text: string, skipConfigLoading: boolean) => ServerDocument;
	html: HtmlPlugin;
}

let modules: Modules | undefined;

/** The server's plugins, set up as Visual Studio Code sets them up: it folds whole lines. */
function server(): Modules {
	if (modules) return modules;
	const { Document, DocumentManager } = load(path.join(SOURCE, 'lib/documents/index.js')) as {
		Document: Modules['Document'];
		DocumentManager: new (create: unknown) => unknown;
	};
	const { LSConfigManager } = load(path.join(SOURCE, 'ls-config.js')) as {
		LSConfigManager: new () => { updateClientCapabilities(capabilities: unknown): void };
	};
	const { HTMLPlugin } = load(path.join(SOURCE, 'plugins/html/HTMLPlugin.js')) as {
		HTMLPlugin: new (
			documents: unknown,
			config: unknown,
			files: undefined,
			folders: unknown[],
		) => HtmlPlugin;
	};
	const config = new LSConfigManager();
	config.updateClientCapabilities({ textDocument: { foldingRange: { lineFoldingOnly: true } } });
	const html = new HTMLPlugin(new DocumentManager(() => undefined), config, undefined, []);
	modules = { Document, html };
	return modules;
}

/** `text` as the server's document at `filename`, without a Svelte configuration. */
export function document(filename: string, text: string): ServerDocument {
	return new (server().Document)(`file:///${filename}`, text, true);
}

/** Where the server's HTML plugin folds `opened`. */
export function foldingRanges(opened: ServerDocument): FoldingRange[] {
	return server().html.getFoldingRanges(opened);
}
