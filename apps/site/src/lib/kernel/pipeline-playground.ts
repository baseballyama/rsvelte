import type { PipelineStep } from './pipeline-browser';

export const plugins = [
	{ id: 'svelte', name: 'Svelte', description: 'Svelte の構文を読み取り、コンパイル・整形・コード検査を提供します。' },
	{ id: 'vue', name: 'Vue', description: 'Vue の構文を読み取り、コンパイル・整形・コード検査を提供します。' },
	{ id: 'svue', name: 'Vue から Svelte のランタイムへ', description: 'Vue のコンポーネントを Vue の意味のまま、Svelte のランタイムで動く JavaScript にコンパイルします。' },
	{ id: 'vuelte', name: 'Svelte から Vue Vapor のランタイムへ', description: 'Svelte のコンポーネントを Svelte の意味のまま、Vue Vapor のランタイムで動く JavaScript にコンパイルします。' }
];

export const operations = [
	{ id: 'compile-client', name: 'ブラウザ向けにコンパイル', description: '画面を更新する JavaScript を出力します。' },
	{ id: 'compile-server', name: 'サーバー向けにコンパイル', description: 'サーバー描画用の JavaScript を出力します。' },
	{ id: 'format', name: '整形', description: '元のソースの改行と字下げを整えます。' },
	{ id: 'lint', name: 'コード検査', description: '使っていない変数などを調べます。型検査とは別の処理です。' }
];

export const examples = [
	{
		id: 'svelte', name: 'Svelte', filename: 'Counter.svelte', plugin: 'svelte',
		source: '<script>\n  let count = $state(0);\n</script>\n\n<button onclick={() => count++}>\n  Count: {count}\n</button>\n\n<style>\n  button { color: royalblue; }\n</style>\n'
	},
	{
		id: 'vue', name: 'Vue', filename: 'Counter.vue', plugin: 'vue',
		source: '<script setup>\nimport { ref } from "vue";\nconst count = ref(0);\n</script>\n\n<template>\n  <button @click="count++">Count: {{ count }}</button>\n</template>\n\n<style scoped>\nbutton { color: royalblue; }\n</style>\n'
	},
	{
		id: 'svue', name: 'Vue を Svelte のランタイムへ', filename: 'Counter.vue', plugin: 'svue',
		source: '<script setup>\nimport { ref } from "vue";\nconst count = ref(0);\n</script>\n\n<template>\n  <button @click="count++">Count: {{ count }}</button>\n</template>\n'
	},
	{
		id: 'vuelte', name: 'Svelte を Vue Vapor のランタイムへ', filename: 'Counter.svelte', plugin: 'vuelte',
		source: '<script>\n  let count = $state(0);\n</script>\n\n<button onclick={() => count++}>\n  Count: {count}\n</button>\n'
	}
];

const artifactLabels: Record<string, { name: string; description: string }> = {
	'svelte.parse': { name: 'Svelte の構文の読み取り', description: 'スクリプト・テンプレート・スタイルを構文木にします。' },
	'vue.parse': { name: 'Vue の構文の読み取り', description: 'スクリプト・テンプレート・スタイルを構文木にします。' },
	'svelte.resolve': { name: '変数と参照の対応付け', description: '名前がどの宣言を指すかを調べます。' },
	'vue.resolve': { name: '変数と参照の対応付け', description: '名前がどの宣言を指すかを調べます。' },
	'svelte.compiler_syntax_tree': { name: 'テンプレートの中間表現', description: '構文木をコンパイラが扱う表現に変換します。' },
	'vue.compiler_syntax_tree': { name: 'テンプレートの中間表現', description: 'Vue のテンプレートを、コンパイラが扱う表現に変換します。' },
	'svue.translate.client': { name: 'Vue から Svelte への翻訳（ブラウザ向け）', description: 'Vue のコンポーネントを、Svelte の runes を使うスクリプトとテンプレートの中間表現に翻訳します。' },
	'svue.translate.server': { name: 'Vue から Svelte への翻訳（サーバー向け）', description: 'Vue のコンポーネントを、Svelte の runes を使うスクリプトとテンプレートの中間表現に翻訳します。' },
	'svue.resolve.client': { name: '翻訳したスクリプトの対応付け（ブラウザ向け）', description: '翻訳したスクリプトの名前がどの宣言を指すかを調べます。' },
	'svue.resolve.server': { name: '翻訳したスクリプトの対応付け（サーバー向け）', description: '翻訳したスクリプトの名前がどの宣言を指すかを調べます。' },
	'svelte.analyze': { name: '更新とスタイルの解析', description: '動的に更新する部分や使われるスタイルを調べます。' },
	'svue.analyze.client': { name: '更新とスタイルの解析（ブラウザ向け）', description: 'Svelte のコンパイラで動的な部分を調べます。' },
	'svue.analyze.server': { name: '更新とスタイルの解析（サーバー向け）', description: 'Svelte のコンパイラで動的な部分を調べます。' },
	'vuelte.check': { name: 'Vue に写せるかの確認', description: 'Vue のランタイムで同じ意味を再現できない構文を、出力の前に見つけて拒否します。' },
	'svelte.css': { name: 'スタイルの変換', description: 'コンポーネントに限定したスタイルを出力します。' },
	'svelte.render_plan': { name: '描画する範囲の計画', description: 'JavaScript を組み立てる前に、出力先によらない描画の範囲と名前空間を決めます。' },
	'svelte.output_identity': { name: '出力の名前とスタイルのハッシュ', description: 'コンポーネントの名前と、スタイルと head に付けるハッシュを決めます。' },
	'svelte.validate': { name: 'コンパイル前の確認', description: 'カスタム要素の設定、対応する構文、TypeScript の書き方、ストアの使い方を、JavaScript を組み立てる前に確かめます。' },
	'svelte.lint.parents': { name: 'JavaScript の親要素の表', description: 'コード検査のために、スクリプトの各要素の親を引ける表を作ります。' }
};

export function artifactLabel(id: string) {
	return artifactLabels[id] ?? { name: id, description: 'プラグインが計算した結果です。' };
}

const pluginLabels: Record<string, string> = { svelte: 'Svelte', vue: 'Vue', svue: 'Vue → Svelte', vuelte: 'Svelte → Vue Vapor' };
const taskKinds: Record<string, string> = {
	'compile/client': 'ブラウザ向け', 'compile/default': 'ブラウザ向け', 'compile/server': 'サーバー向け',
	'format/default': '整形', 'lint/default': 'コード検査'
};

/** The plugin and the task, because two plugins can register the same kind of task for one input. */
export function taskLabel(id: string): string {
	const dot = id.indexOf('.');
	const plugin = pluginLabels[id.slice(0, dot)];
	const kind = taskKinds[id.slice(dot + 1)];
	return plugin && kind ? `${plugin}・${kind}` : id;
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
		throw new Error('リンクの内容が正しくありません');
	}
	return value as PlaygroundState;
}

export type Problem = { line: number; column: number; code: string; message: string; kind: '診断' | 'コード検査の指摘' };

/** Diagnostics of the task, then the findings the lint task writes into `lint.json`; both point at the source. */
export function problems(step: PipelineStep): Problem[] {
	const list: Problem[] = step.diagnostics.map((diagnostic) => ({ ...diagnostic, kind: '診断' }));
	const report = step.files.find((file) => file.name === 'lint.json');
	if (report) {
		const parsed = JSON.parse(report.text) as { findings: { rule: string; message: string; start: { line: number; column: number } }[] };
		for (const finding of parsed.findings) list.push({ line: finding.start.line, column: finding.start.column, code: finding.rule, message: finding.message, kind: 'コード検査の指摘' });
	}
	return list;
}
