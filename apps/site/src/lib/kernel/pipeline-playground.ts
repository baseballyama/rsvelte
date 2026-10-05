import { bilingual, type Lang } from '../i18n';
import type { PipelineStep } from './pipeline-browser';

export const plugins = [
	{
		id: 'svelte',
		name: bilingual('Svelte', 'Svelte'),
		description: bilingual('Svelte の構文を読み取り、コンパイル・整形・コード検査を提供します。', 'Reads Svelte syntax and provides compiling, formatting, and lint.')
	},
	{
		id: 'vue',
		name: bilingual('Vue', 'Vue'),
		description: bilingual('Vue の構文を読み取り、コンパイル・整形・コード検査を提供します。', 'Reads Vue syntax and provides compiling, formatting, and lint.')
	},
	{
		id: 'svue',
		name: bilingual('Vue から Svelte のランタイムへ', 'Vue to the Svelte runtime'),
		description: bilingual(
			'Vue のコンポーネントを Vue の意味のまま、Svelte のランタイムで動く JavaScript にコンパイルします。',
			'Compiles a Vue component, with its Vue behavior, into JavaScript that runs on the Svelte runtime.'
		)
	},
	{
		id: 'vuelte',
		name: bilingual('Svelte から Vue Vapor のランタイムへ', 'Svelte to the Vue Vapor runtime'),
		description: bilingual(
			'Svelte のコンポーネントを Svelte の意味のまま、Vue Vapor のランタイムで動く JavaScript にコンパイルします。',
			'Compiles a Svelte component, with its Svelte behavior, into JavaScript that runs on the Vue Vapor runtime.'
		)
	}
];

export const operations = [
	{
		id: 'compile-client',
		name: bilingual('ブラウザ向けにコンパイル', 'Compile for the browser'),
		description: bilingual('画面を更新する JavaScript を出力します。', 'Writes JavaScript that updates the page.')
	},
	{
		id: 'compile-server',
		name: bilingual('サーバー向けにコンパイル', 'Compile for the server'),
		description: bilingual('サーバー描画用の JavaScript を出力します。', 'Writes JavaScript for server-side rendering.')
	},
	{
		id: 'format',
		name: bilingual('整形', 'Format'),
		description: bilingual('元のソースの改行と字下げを整えます。', 'Fixes the line breaks and indentation of the original source.')
	},
	{
		id: 'lint',
		name: bilingual('コード検査', 'Lint'),
		description: bilingual('使っていない変数などを調べます。型検査とは別の処理です。', 'Looks for problems such as unused variables. This is separate from type checking.')
	}
];

export const examples = [
	{
		id: 'svelte', name: bilingual('Svelte', 'Svelte'), filename: 'Counter.svelte', plugin: 'svelte',
		source: '<script>\n  let count = $state(0);\n</script>\n\n<button onclick={() => count++}>\n  Count: {count}\n</button>\n\n<style>\n  button { color: royalblue; }\n</style>\n'
	},
	{
		id: 'vue', name: bilingual('Vue', 'Vue'), filename: 'Counter.vue', plugin: 'vue',
		source: '<script setup>\nimport { ref } from "vue";\nconst count = ref(0);\n</script>\n\n<template>\n  <button @click="count++">Count: {{ count }}</button>\n</template>\n\n<style scoped>\nbutton { color: royalblue; }\n</style>\n'
	},
	{
		id: 'svue', name: bilingual('Vue を Svelte のランタイムへ', 'Vue on the Svelte runtime'), filename: 'Counter.vue', plugin: 'svue',
		source: '<script setup>\nimport { ref } from "vue";\nconst count = ref(0);\n</script>\n\n<template>\n  <button @click="count++">Count: {{ count }}</button>\n</template>\n'
	},
	{
		id: 'vuelte', name: bilingual('Svelte を Vue Vapor のランタイムへ', 'Svelte on the Vue Vapor runtime'), filename: 'Counter.svelte', plugin: 'vuelte',
		source: '<script>\n  let count = $state(0);\n</script>\n\n<button onclick={() => count++}>\n  Count: {count}\n</button>\n'
	}
];

type Label = { name: string; description: string };

const artifactLabels: Record<string, Record<Lang, Label>> = {
	'svelte.parse': bilingual(
		{ name: 'Svelte の構文の読み取り', description: 'スクリプト・テンプレート・スタイルを構文木にします。' },
		{ name: 'Svelte parsing', description: 'Turns the script, the template, and the styles into a syntax tree.' }
	),
	'vue.parse': bilingual(
		{ name: 'Vue の構文の読み取り', description: 'スクリプト・テンプレート・スタイルを構文木にします。' },
		{ name: 'Vue parsing', description: 'Turns the script, the template, and the styles into a syntax tree.' }
	),
	'svelte.resolve': bilingual(
		{ name: '変数と参照の対応付け', description: '名前がどの宣言を指すかを調べます。' },
		{ name: 'Name resolution', description: 'Finds the declaration that each name refers to.' }
	),
	'vue.resolve': bilingual(
		{ name: '変数と参照の対応付け', description: '名前がどの宣言を指すかを調べます。' },
		{ name: 'Name resolution', description: 'Finds the declaration that each name refers to.' }
	),
	'svelte.compiler_syntax_tree': bilingual(
		{ name: 'テンプレートの中間表現', description: '構文木をコンパイラが扱う表現に変換します。' },
		{ name: 'Template intermediate representation', description: 'Converts the syntax tree into the form that the compiler works on.' }
	),
	'vue.compiler_syntax_tree': bilingual(
		{ name: 'テンプレートの中間表現', description: 'Vue のテンプレートを、コンパイラが扱う表現に変換します。' },
		{ name: 'Template intermediate representation', description: 'Converts the Vue template into the form that the compiler works on.' }
	),
	'svue.translate.client': bilingual(
		{ name: 'Vue から Svelte への翻訳（ブラウザ向け）', description: 'Vue のコンポーネントを、Svelte の runes を使うスクリプトとテンプレートの中間表現に翻訳します。' },
		{
			name: 'Vue to Svelte translation (browser)',
			description: 'Translates the Vue component into a script that uses Svelte runes and the intermediate representation of a template.'
		}
	),
	'svue.translate.server': bilingual(
		{ name: 'Vue から Svelte への翻訳（サーバー向け）', description: 'Vue のコンポーネントを、Svelte の runes を使うスクリプトとテンプレートの中間表現に翻訳します。' },
		{
			name: 'Vue to Svelte translation (server)',
			description: 'Translates the Vue component into a script that uses Svelte runes and the intermediate representation of a template.'
		}
	),
	'svue.resolve.client': bilingual(
		{ name: '翻訳したスクリプトの対応付け（ブラウザ向け）', description: '翻訳したスクリプトの名前がどの宣言を指すかを調べます。' },
		{ name: 'Name resolution of the translated script (browser)', description: 'Finds the declaration that each name in the translated script refers to.' }
	),
	'svue.resolve.server': bilingual(
		{ name: '翻訳したスクリプトの対応付け（サーバー向け）', description: '翻訳したスクリプトの名前がどの宣言を指すかを調べます。' },
		{ name: 'Name resolution of the translated script (server)', description: 'Finds the declaration that each name in the translated script refers to.' }
	),
	'svelte.analyze': bilingual(
		{ name: '更新とスタイルの解析', description: '動的に更新する部分や使われるスタイルを調べます。' },
		{ name: 'Update and style analysis', description: 'Finds the parts that update at run time and the styles that are used.' }
	),
	'svue.analyze.client': bilingual(
		{ name: '更新とスタイルの解析（ブラウザ向け）', description: 'Svelte のコンパイラで動的な部分を調べます。' },
		{ name: 'Update and style analysis (browser)', description: 'Finds the dynamic parts with the Svelte compiler.' }
	),
	'svue.analyze.server': bilingual(
		{ name: '更新とスタイルの解析（サーバー向け）', description: 'Svelte のコンパイラで動的な部分を調べます。' },
		{ name: 'Update and style analysis (server)', description: 'Finds the dynamic parts with the Svelte compiler.' }
	),
	'vuelte.check': bilingual(
		{ name: 'Vue に写せるかの確認', description: 'Vue のランタイムで同じ意味を再現できない構文を、出力の前に見つけて拒否します。' },
		{
			name: 'Check that Vue can express it',
			description: 'Before any output, finds and rejects syntax whose behavior the Vue runtime cannot reproduce.'
		}
	),
	'svelte.css': bilingual(
		{ name: 'スタイルの変換', description: 'コンポーネントに限定したスタイルを出力します。' },
		{ name: 'Style transform', description: 'Writes styles that apply only to the component.' }
	),
	'svelte.render_plan': bilingual(
		{ name: '描画する範囲の計画', description: 'JavaScript を組み立てる前に、出力先によらない描画の範囲と名前空間を決めます。' },
		{
			name: 'Rendering plan',
			description: 'Before building the JavaScript, decides the rendering ranges and namespaces that do not depend on the output target.'
		}
	),
	'svelte.output_identity': bilingual(
		{ name: '出力の名前とスタイルのハッシュ', description: 'コンポーネントの名前と、スタイルと head に付けるハッシュを決めます。' },
		{ name: 'Output name and style hash', description: 'Decides the component name and the hash added to the styles and the head.' }
	),
	'svelte.validate': bilingual(
		{ name: 'コンパイル前の確認', description: 'カスタム要素の設定、対応する構文、TypeScript の書き方、ストアの使い方を、JavaScript を組み立てる前に確かめます。' },
		{
			name: 'Checks before compiling',
			description: 'Before building the JavaScript, checks custom element settings, supported syntax, TypeScript usage, and store usage.'
		}
	),
	'svelte.lint.parents': bilingual(
		{ name: 'JavaScript の親要素の表', description: 'コード検査のために、スクリプトの各要素の親を引ける表を作ります。' },
		{ name: 'JavaScript parent table', description: 'For lint, builds a table that gives the parent of each node in the script.' }
	)
};

const unknownArtifact = bilingual('プラグインが計算した結果です。', 'A result that a plugin computed.');

export function artifactLabel(id: string, lang: Lang): Label {
	return artifactLabels[id]?.[lang] ?? { name: id, description: unknownArtifact[lang] };
}

const pluginLabels: Record<string, string> = { svelte: 'Svelte', vue: 'Vue', svue: 'Vue → Svelte', vuelte: 'Svelte → Vue Vapor' };
const browser = bilingual('ブラウザ向け', 'browser');
const taskKinds: Record<string, Record<Lang, string>> = {
	'compile/client': browser, 'compile/default': browser, 'compile/server': bilingual('サーバー向け', 'server'),
	'format/default': bilingual('整形', 'format'), 'lint/default': bilingual('コード検査', 'lint')
};
const joinTaskLabel = bilingual((plugin: string, kind: string) => `${plugin}・${kind}`, (plugin: string, kind: string) => `${plugin} (${kind})`);

/** The plugin and the task, because two plugins can register the same kind of task for one input. */
export function taskLabel(id: string, lang: Lang): string {
	const dot = id.indexOf('.');
	const plugin = pluginLabels[id.slice(0, dot)];
	const kind = taskKinds[id.slice(dot + 1)];
	return plugin && kind ? joinTaskLabel[lang](plugin, kind[lang]) : id;
}

export function accessSummary(step: PipelineStep) {
	const summary = new Map<string, { name: string; computed: number; reused: number }>();
	for (const access of step.accesses) {
		let item = summary.get(access.name);
		if (!item) {
			item = { name: access.name, computed: 0, reused: 0 };
			summary.set(access.name, item);
		}
		if (access.cached) item.reused++;
		else item.computed++;
	}
	return [...summary.values()];
}

export function computationCount(steps: PipelineStep[], name?: string) {
	return steps.reduce((count, step) => count + step.accesses.filter((access) =>
		!access.cached && (name === undefined || access.name === name)
	).length, 0);
}

/** Which task read which artifact: rows in the order the tasks first asked for them. */
export function accessTable(steps: PipelineStep[]) {
	const rows: string[] = [];
	const seen = new Set<string>();
	for (const step of steps) for (const access of step.accesses) if (!seen.has(access.name)) { seen.add(access.name); rows.push(access.name); }
	return rows.map((name) => ({
		name,
		cells: steps.map((step) => {
			const own = step.accesses.filter((access) => access.name === name);
			return { computed: own.filter((access) => !access.cached).length, reused: own.filter((access) => access.cached).length };
		})
	}));
}

export type PlaygroundState = { example: string; source: string; plugins: string[]; operations: string[]; shared: boolean };

const STATE_PREFIX = '#state=';

function toBase64Url(bytes: Uint8Array): string {
	let text = '';
	for (const byte of bytes) text += String.fromCharCode(byte);
	return btoa(text).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
	const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
	return new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream)).arrayBuffer());
}

export async function encodeState(state: PlaygroundState): Promise<string> {
	const json = new TextEncoder().encode(JSON.stringify(state));
	return STATE_PREFIX + toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
}

/** `null` when the hash holds no state; throws when it holds state that cannot be read. */
export async function decodeState(hash: string): Promise<PlaygroundState | null> {
	if (!hash.startsWith(STATE_PREFIX)) return null;
	const bytes = await pipe(fromBase64Url(hash.slice(STATE_PREFIX.length)), new DecompressionStream('deflate-raw'));
	const value = JSON.parse(new TextDecoder().decode(bytes)) as Partial<PlaygroundState>;
	const strings = (list: unknown) => Array.isArray(list) && list.every((item) => typeof item === 'string');
	if (!examples.some((item) => item.id === value.example) || typeof value.source !== 'string' || !strings(value.plugins) || !strings(value.operations) || typeof value.shared !== 'boolean') {
		throw new Error('invalid playground state in the link');
	}
	return value as PlaygroundState;
}

export type Problem = { line: number; column: number; code: string; message: string; kind: 'diagnostic' | 'lint' };

/** Diagnostics of the task, then the findings the lint task writes into `lint.json`; both point at the source. */
export function problems(step: PipelineStep): Problem[] {
	const list: Problem[] = step.diagnostics.map((diagnostic) => ({ ...diagnostic, kind: 'diagnostic' }));
	const report = step.files.find((file) => file.name === 'lint.json');
	if (report) {
		const parsed = JSON.parse(report.text) as { findings: { rule: string; message: string; start: { line: number; column: number } }[] };
		for (const finding of parsed.findings) list.push({ line: finding.start.line, column: finding.start.column, code: finding.rule, message: finding.message, kind: 'lint' });
	}
	return list;
}
