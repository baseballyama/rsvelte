export const pipelineTasks = [
	{
		identifier: 'format',
		label: '整形',
		input: 'ソース AST・トークン',
		output: '整形した Svelte',
		nodes: ['format'],
	},
	{
		identifier: 'lint',
		label: 'コード検査',
		input: 'ソース AST・HIR・参照情報',
		output: '未使用変数の診断',
		nodes: ['lint'],
	},
	{
		identifier: 'compile',
		label: 'コンパイル',
		input: 'HIR・スコープ・参照情報',
		output: 'JavaScript・スタイル',
		nodes: ['analyze', 'lower', 'emit'],
	},
	{
		identifier: 'check',
		label: '型検査',
		input: '元のソース AST',
		output: 'Svelte 上の型エラー',
		nodes: ['projection', 'typescript', 'mapping'],
	},
];

export const pipelineExamples = {
	input: {
		language: 'svelte',
		source:
			'<script lang="ts">\nlet name: string = $state("Ada");\nconst unused = 1;\n</script>\n<p class="greeting">{name.toFixed(2)}</p>\n<style>.greeting {color: navy;}</style>',
	},
	parsed: {
		language: 'text',
		source:
			'ソース AST: Component\nGreeting.svelte\n├─ script: TypeScript\n│  ├─ name: string = $state("Ada")\n│  └─ unused = 1\n├─ template: <p>\n│  └─ expression: name.toFixed(2)\n└─ style: .greeting { color: navy; }',
	},
	format: {
		language: 'svelte',
		source:
			'<script lang="ts">\n  let name: string = $state("Ada");\n  const unused = 1;\n</script>\n\n<p class="greeting">{name.toFixed(2)}</p>\n\n<style>\n  .greeting {\n    color: navy;\n  }\n</style>',
	},
	normalized: {
		language: 'text',
		source:
			'テンプレート HIR: CompilerSyntaxTree\nElement: p\n  Attribute: class="greeting"\n  Expression:\n    Call: name.toFixed(2)\n式は元の JavaScript/TypeScript AST のノードを参照する。',
	},
	resolved: {
		language: 'text',
		source:
			'1. スコープと宣言を登録\n   ルートスコープ: name, unused\n2. 識別子の参照先と読み書きを記録\n   name（テンプレート）→ script の name\n   name: 読み取り 1 件、宣言後の書き込み 0 件\n   unused: 読み取り 0 件\n3. Svelte 固有の宣言の種類を分類\n   name: $state、unused: 通常の変数\n保存: スコープ表・宣言表・参照表\n制御フローグラフと型の判定は含まない。',
	},
	lint: {
		language: 'text',
		source:
			'Greeting.svelte:3\nconst unused = 1;\n      ^^^^^^\n未使用の変数 unused を報告する。\nname はテンプレートで参照されている。',
	},
	analyze: {
		language: 'text',
		source:
			'コード生成に必要な解析\nname: $state で作るリアクティブな状態\nテンプレート: name に依存する式\nスタイル: .greeting と要素の対応\n型検査の結果は入力に含まない。',
	},
	lower: {
		language: 'text',
		source:
			'入力: テンプレート HIR + JavaScript/TypeScript AST\n      + 解析結果 + RenderPlan\n出力: LoweredModule\n      クライアント向けの JavaScript AST\n元のソース AST と HIR は変更しない。',
	},
	emit: {
		language: 'javascript',
		source:
			'// Greeting.js のテキスト更新部分の抜粋\n$.template_effect(\n  ($0) => $.set_text(text, $0),\n  [() => name.toFixed(2)]\n);',
	},
	projection: {
		language: 'typescript',
		source:
			'// 型検査用 TypeScript の、説明のための抜粋\nlet name: string = $state("Ada");\nconst unused = 1;\n\n// 元のテンプレートの式を検査する\nname.toFixed(2);',
	},
	typescript: {
		language: 'text',
		source:
			'検査用 TypeScript + 他のファイル + 型宣言\n  → プロジェクト全体で tsc を 1 回起動\nname: string\ntoFixed: string には存在しない\n診断の位置は、まだ検査用 TypeScript 上。',
	},
	mapping: {
		language: 'svelte',
		source:
			'<p class="greeting">{name.toFixed(2)}</p>\n<!-- string に toFixed は存在しない。\n     診断を元の Svelte の式に対応付ける。 -->',
	},
};

export const pipelineStages = [
	{
		identifier: 'input',
		structure: 'ソーステキスト',
		label: 'Svelte ファイル',
		description:
			'同じ Greeting.svelte のスナップショットに 4 種類の処理を実行します。name は string ですが、テンプレートでは数値用の toFixed を呼んでいます。',
		reads: [],
	},
	{
		identifier: 'parsed',
		structure: 'Component・SyntaxTree・トークン',
		label: 'ソース AST を生成',
		description:
			'ソース AST とトークンを保存します。Component が、テンプレート、JavaScript/TypeScript AST、スタイルの構文木を持ちます。スクリプトとテンプレートの JavaScript 式は、同じ SyntaxTree に入ります。同じ実行コンテキストの中では、このソースの構文解析は 1 回だけです。',
		reads: ['input'],
	},
	{
		identifier: 'format',
		structure: '整形した Svelte テキスト',
		label: '整形',
		description:
			'保存した構文木と元のソースから、字下げや空白を整えた Svelte を出力します。名前解決や型検査は使いません。整形結果は、後の処理の入力になりません。',
		reads: ['parsed'],
	},
	{
		identifier: 'normalized',
		structure: 'CompilerSyntaxTree',
		label: 'テンプレート HIR を生成',
		description:
			'ソース AST のテンプレートを HIR に変換します。CompilerSyntaxTree が、分岐や属性をコンパイラ向けに整理します。JavaScript 式は元の JavaScript/TypeScript AST のノードを参照します。HIR のノードは、元のテンプレートとの対応を持ちます。',
		reads: ['parsed'],
	},
	{
		identifier: 'resolved',
		structure: 'Resolution・Semantic のサイドテーブル',
		label: 'スコープ構築・参照解析',
		description:
			'1 回目の走査で、スコープの親子関係と宣言を登録します。2 回目の走査で参照先を解決し、読み取りと書き込みを記録します。Svelte の宣言を runes などの種類に分け、スコープ・宣言・参照の表を共有します。制御フローグラフは作りません。',
		reads: ['parsed', 'normalized'],
	},
	{
		identifier: 'lint',
		structure: 'ルールごとの指摘',
		label: 'コード検査の指摘',
		description:
			'保存した木と、スコープ・参照の情報でルールを評価します。unused には参照がありません。name はテンプレートから参照されているので、未使用の変数になりません。',
		reads: ['parsed', 'normalized', 'resolved'],
	},
	{
		identifier: 'analyze',
		structure: 'Analysis・RenderPlan',
		label: 'コンパイル用の解析',
		description:
			'保存したスコープ・参照の情報と、コンパイラ用の木を再利用します。Analysis は、リアクティビティやスタイルなどの解析結果を持ちます。RenderPlan は、HIR から作った描画の計画を持ちます。',
		reads: ['parsed', 'normalized', 'resolved'],
	},
	{
		identifier: 'lower',
		structure: 'LoweredModule・SyntaxTree',
		label: '出力用の JavaScript AST を生成',
		description:
			'テンプレート HIR、JavaScript/TypeScript AST、解析結果、描画の計画から、出力用の JavaScript AST を新しく作ります。LoweredModule がこの AST を持ちます。この例ではクライアント向けを選びます。',
		reads: ['analyze', 'normalized', 'resolved'],
	},
	{
		identifier: 'emit',
		structure: 'JavaScript・スタイルのテキスト',
		label: 'JavaScript・スタイルを出力',
		description:
			'生成した JavaScript の木を文字列にし、スコープ付きのスタイルと合わせて返します。コード欄は、生成されたテキスト更新処理の抜粋です。toFixed の呼び出しもそのまま出力します。型が正しいかは、後の型検査が判定します。',
		reads: ['lower'],
	},
	{
		identifier: 'projection',
		structure: 'TypeScript テキスト・位置の対応表',
		label: '検査用 TypeScript を生成',
		description:
			'元のソース AST から、テンプレートの式も検査できる TypeScript テキストと、位置の対応表を作ります。コンパイルした JavaScript は使いません。コード欄は仕組みを示す抜粋で、生成コードの全文ではありません。',
		reads: ['parsed'],
	},
	{
		identifier: 'typescript',
		structure: 'TypeScript 上の診断',
		label: 'プロジェクト全体を型検査',
		description:
			'全ファイルの検査用 TypeScript がそろった後、型宣言と設定を合わせて tsc を 1 回起動します。tsc は生成した TypeScript を自分で解析し、string に toFixed がないことを見つけます。',
		reads: ['projection'],
	},
	{
		identifier: 'mapping',
		structure: 'Svelte 上の診断',
		label: '診断の位置を Svelte に戻す',
		description:
			'生成時に作った位置の対応表で、TypeScript 上の診断を Greeting.svelte の name.toFixed(2) に戻します。利用者には、元の Svelte ファイルでの位置を返します。',
		reads: ['typescript', 'projection'],
	},
];

export function selectedPipeline(selected: string[]) {
	const needsSemantic = selected.includes('lint') || selected.includes('compile');
	const requested = new Set([
		'input',
		'parsed',
		...(needsSemantic ? ['normalized', 'resolved'] : []),
		...pipelineTasks
			.filter((task) => selected.includes(task.identifier))
			.flatMap((task) => task.nodes),
	]);
	return selected.length ? pipelineStages.filter((stage) => requested.has(stage.identifier)) : [];
}
