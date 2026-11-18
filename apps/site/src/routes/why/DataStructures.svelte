<div class="data-structures">
	<table>
		<caption>処理の途中で保持する主なデータ構造</caption>
		<thead
			><tr
				><th scope="col">データ構造</th><th scope="col">保持する情報</th><th scope="col"
					>使う処理</th
				></tr
			></thead
		>
		<tbody>
			<tr
				><th scope="row">ソース AST<br /><code>Component</code></th><td
					>テンプレートのノード、JavaScript/TypeScript の
					AST、スタイルの構文木、元のソース内の範囲。字句トークンも持つ。</td
				><td>整形、HIR の生成、コード検査、型検査用コードの生成。</td></tr
			>
			<tr
				><th scope="row">JavaScript/TypeScript の AST<br /><code>SyntaxTree</code></th><td
					>スクリプトと、テンプレート内の JavaScript の式を、同じ木に入れる。</td
				><td>スコープと参照の解析、コード検査、コンパイル。</td></tr
			>
			<tr
				><th scope="row">テンプレート HIR<br /><code>CompilerSyntaxTree</code></th><td
					>分岐や属性を整理したノード、親子関係、元のテンプレートとの対応。JavaScript
					の式は、JavaScript/TypeScript の AST のノードを参照する。</td
				><td>スコープと参照の解析、コード検査、コンパイル用の解析と描画計画。</td></tr
			>
			<tr
				><th scope="row">スコープと参照の表<br /> <code>Resolution</code>・<code>Semantic</code></th
				><td
					>スコープ、宣言、参照先、読み書き、Svelte 固有の宣言の種類。AST や HIR
					のノードには書き込まず、別の表に保存する。</td
				><td>コード検査、コンパイル。</td></tr
			>
			<tr
				><th scope="row"
					>コンパイル用の解析結果と描画計画<br /> <code>Analysis</code>・<code>RenderPlan</code></th
				><td>式の依存関係、動的な部分、スタイルの対応、描画する領域の計画。</td><td
					>出力する JavaScript の AST の生成、スタイルの生成。</td
				></tr
			>
			<tr
				><th scope="row">出力する JavaScript の AST<br /><code>LoweredModule</code></th><td
					>コンパイル先に合わせて新しく作った <code>SyntaxTree</code>。元のソース AST とは別の木。</td
				><td>JavaScript のテキストの出力。</td></tr
			>
			<tr
				><th scope="row"
					>型検査用のテキストと位置の対応表<br /> <code>TypeScriptDocument</code>・<code
						>Emitter</code
					></th
				><td
					>元のソース AST から生成した TypeScript と、元の Svelte の位置への対応。テンプレート HIR
					や出力する JavaScript の AST とは別のデータ。</td
				><td>外部の型検査器、診断の位置の変換。</td></tr
			>
		</tbody>
	</table>
</div>

<style>
	.data-structures {
		overflow-x: auto;
		margin: 28px 0;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	table {
		width: 100%;
		min-width: 650px;
		border-collapse: collapse;
		font-size: 13px;
		line-height: 1.8;
	}
	caption {
		padding: 16px;
		text-align: left;
		font-weight: 600;
		background: var(--sunken);
	}
	th,
	td {
		padding: 14px 16px;
		text-align: left;
		vertical-align: top;
		border-top: 1px solid var(--border);
	}
	th {
		font-weight: 600;
	}
	tbody th {
		width: 28%;
	}
	td {
		color: var(--fg-2);
	}
</style>
