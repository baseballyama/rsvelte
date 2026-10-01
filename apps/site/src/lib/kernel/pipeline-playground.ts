import type { PipelineStep } from './pipeline-browser';

export const plugins = [
	{ id: 'svelte', name: 'Svelte', description: 'Svelte の構文を読み取り、コンパイル・整形・コード検査を提供します。' },
	{ id: 'vue', name: 'Vue', description: 'Vue の構文を読み取り、コンパイル・整形・コード検査を提供します。' },
	{ id: 'svue', name: 'Vue の構文 + Svelte のコンパイラ', description: 'Vue の構文で書いた文書を Svelte の中間表現に変換し、コンパイルします。' }
];

export const operations = [
	{ id: 'compile-client', name: 'ブラウザ向けにコンパイル', description: '画面を更新する JavaScript を出力します。' },
	{ id: 'compile-server', name: 'サーバー向けにコンパイル', description: 'Svelte のサーバー描画用 JavaScript を出力します。' },
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
		id: 'svue', name: 'Vue の構文 + Svelte', filename: 'Counter.svue', plugin: 'svue',
		source: '<script setup>\n  let count = $state(0);\n</script>\n\n<template>\n  <button @click="count++">Count: {{ count }}</button>\n</template>\n\n<style>\n  button { color: royalblue; }\n</style>\n'
	}
];

const artifactLabels: Record<string, { name: string; description: string }> = {
	'svelte.parse': { name: 'Svelte の構文の読み取り', description: 'スクリプト・テンプレート・スタイルを構文木にします。' },
	'vue.parse': { name: 'Vue の構文の読み取り', description: 'スクリプト・テンプレート・スタイルを構文木にします。' },
	'svelte.resolve': { name: '変数と参照の対応付け', description: '名前がどの宣言を指すかを調べます。' },
	'vue.resolve': { name: '変数と参照の対応付け', description: '名前がどの宣言を指すかを調べます。' },
	'svue.resolve': { name: 'Svelte の変数と参照の対応付け', description: 'Vue の構文木の名前を Svelte の規則で解決します。' },
	'svelte.compiler_syntax_tree': { name: 'テンプレートの中間表現', description: '構文木をコンパイラが扱う表現に変換します。' },
	'svue.frontend': { name: 'Vue から Svelte の中間表現へ変換', description: 'Vue のテンプレートを Svelte のコンパイラに渡せる表現に変換します。' },
	'svelte.analyze': { name: '更新とスタイルの解析', description: '動的に更新する部分や使われるスタイルを調べます。' },
	'svue.analyze': { name: '更新とスタイルの解析', description: 'Svelte のコンパイラで動的な部分を調べます。' },
	'svelte.css': { name: 'スタイルの変換', description: 'コンポーネントに限定したスタイルを出力します。' }
};

export function artifactLabel(id: string) {
	return artifactLabels[id] ?? { name: id, description: 'プラグインが計算した結果です。' };
}

export function taskLabel(id: string): string {
	if (id.includes('.compile/server')) return 'サーバー向けにコンパイル';
	if (id.includes('.compile/')) return 'ブラウザ向けにコンパイル';
	if (id.includes('.format/')) return '整形';
	if (id.includes('.lint/')) return 'コード検査';
	return id;
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
