<script lang="ts">
	const stack = [
		{
			name: 'svelte.parse',
			layer: '元の構文木',
			what: '書かれたとおりの木。整形はこの木から出力を作る。',
			readers: 'すべて',
		},
		{
			name: 'svelte.compiler_syntax_tree',
			layer: 'コンパイル用に整理した構文木',
			what: 'コンパイラが理解する形のテンプレート。',
			readers: 'compile, lint',
		},
		{
			name: 'svelte.resolve',
			layer: '名前解決',
			what: 'スコープ、名前から束縛への対応、rune の種類。コンパイル用に整理した構文木を読む。整形も、パーサが報告しない構文エラーを見つけるために読む。',
			readers: 'compile, lint, format',
		},
		{
			name: 'svelte.analyze',
			layer: 'コンパイラの解析',
			what: '式の依存、動的な断片、スタイルシートが選ぶ要素。コンパイル用に整理した構文木と名前解決を読む。',
			readers: 'compile',
		},
		{
			name: 'svelte.css',
			layer: '出力',
			what: 'スコープを付けたスタイルシート。',
			readers: 'compile',
		},
		{
			name: 'ts.view',
			layer: '出力（共通の呼び出し窓口）',
			what: '型検査が読む TypeScript。Svelte の文書の分は、元の構文木から作る。',
			readers: 'check',
		},
	];
</script>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>計算結果</th><th>層</th><th>中身</th><th>読むタスク</th></tr></thead>
		<tbody>
			{#each stack as s (s.name)}
				<tr>
					<td class="whitespace-nowrap"><code>{s.name}</code></td>
					<td class="whitespace-nowrap">{s.layer}</td>
					<td class="text-[14.5px] text-fg-2">{s.what}</td>
					<td class="font-mono text-[13px] whitespace-nowrap text-fg-2">{s.readers}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</figure>
