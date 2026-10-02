export const pipelineTasks = [
	{ identifier: 'format', label: 'フォーマット', input: 'ソースAST・トークン', output: '整形したSvelte', nodes: ['format'] },
	{ identifier: 'lint', label: 'Lint', input: 'ソースAST・HIR・参照情報', output: '未使用変数の診断', nodes: ['lint'] },
	{ identifier: 'compile', label: 'コンパイル', input: 'HIR・スコープ・参照情報', output: 'JavaScript・スタイル', nodes: ['analyze', 'lower', 'emit'] },
	{ identifier: 'check', label: '型検査', input: '元のソースAST', output: 'Svelte上の型エラー', nodes: ['projection', 'typescript', 'mapping'] }
];

export const pipelineExamples = {
	input: { language: 'svelte', source: '<script lang="ts">\nlet name: string = $state("Ada");\nconst unused = 1;\n</script>\n<p class="greeting">{name.toFixed(2)}</p>\n<style>.greeting {color: navy;}</style>' },
	parsed: { language: 'text', source: 'ソースAST: Component\nGreeting.svelte\n├─ script: TypeScript\n│  ├─ name: string = $state("Ada")\n│  └─ unused = 1\n├─ template: <p>\n│  └─ expression: name.toFixed(2)\n└─ style: .greeting { color: navy; }' },
	format: { language: 'svelte', source: '<script lang="ts">\n  let name: string = $state("Ada");\n  const unused = 1;\n</script>\n\n<p class="greeting">{name.toFixed(2)}</p>\n\n<style>\n  .greeting {\n    color: navy;\n  }\n</style>' },
	normalized: { language: 'text', source: 'テンプレートHIR: CompilerSyntaxTree\nElement: p\n  Attribute: class="greeting"\n  Expression:\n    Call: name.toFixed(2)\n式は元のJavaScript/TypeScript ASTのノードを参照する。' },
	resolved: { language: 'text', source: '1. スコープと宣言を登録\n   ルートスコープ: name, unused\n2. 識別子の参照先と読み書きを記録\n   name（テンプレート）→ scriptのname\n   name: 読み取り1件、宣言後の書き込み0件\n   unused: 読み取り0件\n3. Svelte固有の宣言種別を分類\n   name: $state、unused: 通常の変数\n保存: スコープ表・宣言表・参照表\n制御フローグラフと型の判定は含まない。' },
	lint: { language: 'text', source: 'Greeting.svelte:3\nconst unused = 1;\n      ^^^^^^\n未使用の変数 unused を報告する。\nname はテンプレートで参照されている。' },
	analyze: { language: 'text', source: 'コード生成に必要な解析\nname: $stateで作るリアクティブな状態\nテンプレート: nameに依存する式\nスタイル: .greetingの対応を解析\n型検査の結果は入力に含まれない。' },
	lower: { language: 'text', source: '入力: テンプレートHIR + JavaScript/TypeScript AST\n      + 解析結果 + RenderPlan\n出力: LoweredModule\n      クライアント向けJavaScript AST\n元のソースASTとHIRは変更しない。' },
	emit: { language: 'javascript', source: '// Greeting.jsのテキスト更新部分を抜粋\n$.template_effect(\n  ($0) => $.set_text(text, $0),\n  [() => name.toFixed(2)]\n);' },
	projection: { language: 'typescript', source: '// 型検査用TypeScriptの説明用の抜粋\nlet name: string = $state("Ada");\nconst unused = 1;\n\n// 元のテンプレートの式を検査する\nname.toFixed(2);' },
	typescript: { language: 'text', source: '検査用TypeScript + 他ファイル + 型宣言\n  → プロジェクト全体でtscを1回起動\nname: string\ntoFixed: stringには存在しない\n診断位置は、まだ検査用TypeScript上。' },
	mapping: { language: 'svelte', source: '<p class="greeting">{name.toFixed(2)}</p>\n<!-- stringにtoFixedは存在しない。\n     診断を元のSvelteの式に対応付ける。 -->' }
};

export const pipelineStages = [
	{ identifier: 'input', structure: 'ソーステキスト', label: 'Svelteファイル', description: '同じGreeting.svelteのスナップショットに、4種類の処理を実行します。nameはstringですが、テンプレートでは数値向けのtoFixedを呼んでいます。', reads: [] },
	{ identifier: 'parsed', structure: 'Component・SyntaxTree・トークン', label: 'ソースASTを生成', description: 'ソースASTとトークンを保存します。Componentがテンプレート、JavaScript/TypeScript AST、スタイルの構文木を保持します。スクリプトとテンプレートのJavaScript式は、同じSyntaxTreeに入ります。このSvelteソースの構文解析は、同じ実行コンテキスト内で1回です。', reads: ['input'] },
	{ identifier: 'format', structure: '整形したSvelteテキスト', label: 'フォーマット', description: '保存した構文木と元のソースから、字下げや空白を整えたSvelteを出力します。名前解決や型検査は要求しません。整形結果を後続タスクの入力に差し替えることもありません。', reads: ['parsed'] },
	{ identifier: 'normalized', structure: 'CompilerSyntaxTree', label: 'テンプレートHIRを生成', description: 'ソースASTのテンプレートをHIRに変換します。CompilerSyntaxTreeが分岐や属性をコンパイラ向けに整理します。JavaScript式は元のJavaScript/TypeScript ASTのノードを参照し、HIRのノードには元のテンプレートとの対応を保持します。', reads: ['parsed'] },
	{ identifier: 'resolved', structure: 'Resolution・Semanticのサイドテーブル', label: 'スコープ構築・参照解析', description: '第1パスでスコープの親子関係と宣言を登録します。第2パスで参照先を解決し、読み取り・書き込みを記録します。Svelteの宣言をrunesなどの種別に分類し、スコープ・宣言・参照の表を共有します。制御フローグラフは生成していません。', reads: ['parsed', 'normalized'] },
	{ identifier: 'lint', structure: 'ルールの診断', label: 'Lintの診断', description: '保存済みの木とスコープ・参照情報を使ってルールを評価します。unusedには参照がありません。nameにはテンプレートからの参照があるため、未使用変数にはなりません。', reads: ['parsed', 'normalized', 'resolved'] },
	{ identifier: 'analyze', structure: 'Analysis・RenderPlan', label: 'コンパイル用の解析', description: '保存済みのスコープ・参照情報とコンパイラ用の木を再利用します。Analysisにリアクティビティやスタイルなどの解析結果を保存します。RenderPlanにはHIRから生成した描画計画を保持します。', reads: ['parsed', 'normalized', 'resolved'] },
	{ identifier: 'lower', structure: 'LoweredModule・SyntaxTree', label: '出力JavaScript ASTを生成', description: 'テンプレートHIR、JavaScript/TypeScript AST、解析結果、描画計画から、出力用のJavaScript ASTを新しく作ります。LoweredModuleがこのASTを保持します。この例ではクライアント向けを選びます。', reads: ['analyze', 'normalized', 'resolved'] },
	{ identifier: 'emit', structure: 'JavaScript・スタイルテキスト', label: 'JavaScript・スタイルを出力', description: '生成したJavaScriptの木を文字列にし、スコープ付きのスタイルと合わせて返します。コード欄は生成されたテキスト更新処理の抜粋です。toFixedの呼び出しも出力され、型の妥当性は後の型検査で判定されます。', reads: ['lower'] },
	{ identifier: 'projection', structure: 'TypeScriptテキスト・位置対応表', label: '検査用TypeScriptを生成', description: '元のソースASTから、テンプレートの式も検査できるTypeScriptテキストと位置の対応表を作ります。コンパイル済みJavaScriptは使いません。コード欄は仕組みを示す抜粋で、実際の生成コード全文ではありません。', reads: ['parsed'] },
	{ identifier: 'typescript', structure: 'TypeScript上の診断', label: 'プロジェクト全体を型検査', description: '全ファイルの検査用TypeScriptがそろった後、型宣言と設定を合わせてtscを1回起動します。tscは生成したTypeScriptを別途解析し、stringにtoFixedがないことを検出します。', reads: ['projection'] },
	{ identifier: 'mapping', structure: 'Svelte上の診断', label: '診断位置をSvelteに戻す', description: '生成時の位置の対応表で、TypeScript上の診断をGreeting.svelteのname.toFixed(2)に戻します。利用者には元のSvelteファイルの位置を返します。', reads: ['typescript', 'projection'] }
];

export function selectedPipeline(selected: string[]) {
	const needsSemantic = selected.includes('lint') || selected.includes('compile');
	const requested = new Set(['input', 'parsed', ...(needsSemantic ? ['normalized', 'resolved'] : []),
		...pipelineTasks.filter(task => selected.includes(task.identifier)).flatMap(task => task.nodes)]);
	return selected.length ? pipelineStages.filter(stage => requested.has(stage.identifier)) : [];
}
