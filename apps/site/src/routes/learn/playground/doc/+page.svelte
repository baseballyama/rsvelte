<script lang="ts">
	import DocumentPrinter from '$lib/widgets/DocumentPrinter.svelte';
	import { call, fill, flatOnly, groupIds, mustBeFlat, remeasure } from '../../kernel/document/presets';

	const object = {
		name: 'オブジェクト',
		width: 36,
		source: `group([
  "const props = {",
  indent([line, join([",", line], ["label: 'クリック'", "count: 0", "disabled: false"])]),
  ifBreak(",", ""),
  line,
  "};"
])`
	};
	const fns = [
		['"text"', 'テキスト（配列は concat）'],
		['line / softline', '平らなら空白 / 何もなし、改行するなら改行'],
		['hardline / literalline', '必ず改行（literalline は字下げしない）'],
		['group(…) / groupBroken(…)', '収まれば平ら / 必ず改行'],
		['groupId("名前", …)', '名前付きの group'],
		['indent(x) / dedent(x)', '字下げを一段増やす / 減らす'],
		['ifBreak(a, b)', '囲む group が改行なら a、平らなら b'],
		['ifBreakOf("名前", a, b)', '名前の group に従う'],
		['indentIfBreak("名前", x)', '名前の group が改行なら字下げ'],
		['fill([内容, 区切り, …])', '収まるだけ詰める'],
		['join(sep, [a, b, …])', 'sep を挟んで並べる'],
		['flatOnly(x)', '平らに収まらなければ Refused'],
		['breakParent', '囲む group を改行させる']
	];
</script>

<svelte:head><title>整形の判断を試す — rsvelte Learn</title></svelte:head>

<header class="mb-6">
	<span class="font-mono text-[13px] tracking-normal text-muted">付録</span>
	<h1 class="mt-1 text-[30px] leading-[1.3] font-semibold sm:text-[36px]" style="font-stretch: 92%">整形の判断を試す</h1>
	<a class="link mt-3 inline-block text-sm" href="/learn/playground">言語プラグインのプレイグラウンドへ戻る</a>
	<p class="mt-4 max-w-[44em] text-[17px] leading-[1.8] text-fg-2">
		整形用のデータ構造を小さな式で書き、Rust のカーネルを WebAssembly としてブラウザで実行して出力します。仕組みは <a class="link" href="/learn/kernel/document">08 レイアウト</a>で説明しています。このページはブラウザだけで動き、サーバーでは描画しません。
	</p>
</header>

<DocumentPrinter label="プレイグラウンド" presets={[object, call, fill, groupIds, flatOnly, remeasure, mustBeFlat]} tall />

<section class="mt-10">
	<h2 class="text-[19px] font-semibold">使える式</h2>
	<table class="table mt-3">
		<tbody>
			{#each fns as [f, d] (f)}
				<tr><td class="w-[45%]"><code>{f}</code></td><td class="text-fg-2">{d}</td></tr>
			{/each}
		</tbody>
	</table>
</section>
