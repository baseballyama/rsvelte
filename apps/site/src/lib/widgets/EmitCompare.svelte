<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { consumerLookup, decodeMappings, Emitter } from '$lib/kernel/emit';

	// The kernel test `spans_map_back_through_copies_and_quotes`, step by step.
	const source = '<p aria-label={x}>';
	const e = new Emitter();
	e.push('f({ ');
	e.mark(3);
	e.push('"');
	e.copy(source, { startOffset: 3, endOffset: 13 });
	e.push('": ');
	e.copy(source, { startOffset: 15, endOffset: 16 });
	e.push(' });');

	const map = e.sourceMap(source, 'App.svelte');
	const perChar = decodeMappings(JSON.parse(map).mappings);
	// One segment per mapping: the example is one ASCII line, so a byte offset is also the column.
	const perMapping = [...e.mappings]
		.sort((a, b) => a.generated - b.generated)
		.map((m) => ({ genLine: 1, genCol: m.generated, sourceLine: 1, sourceCol: m.source }));

	let coarse = $state(false);
	const segments = $derived(coarse ? perMapping : perChar);
	const rows = $derived(
		Array.from(e.out, (ch, position) => {
			const c = consumerLookup(segments, 1, position);
			return { ch, position, kernel: e.lookup(position), consumer: c ? c.sourceCol : null };
		})
	);
	const differ = $derived(rows.filter((r) => r.kernel !== r.consumer).length);
	let at = $state(10);
	const row = $derived(rows[at]);
	const segmentStarts = $derived(new Set(segments.map((s) => s.genCol)));
</script>

<Figure label="図 9.1 · lookup と source map の答え" wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={!coarse} onclick={() => (coarse = false)}>文字ごと（今の実装）</button>
		<button type="button" class="btn-ghost" aria-pressed={coarse} onclick={() => (coarse = true)}>Mapping ごと</button>
	{/snippet}
	<div class="overflow-x-auto p-4">
		<table class="border-collapse font-mono text-[12.5px] tracking-normal">
			<tbody>
				<tr>
					<th class="pr-3 text-left font-normal whitespace-nowrap text-muted">generated</th>
					{#each rows as r (r.position)}
						<td class="p-0">
							<button
								type="button"
								class={[
									'block w-[1.9em] border border-line py-1 text-center',
									r.position === at ? 'bg-fg text-bg' : 'hover:bg-surface',
									segmentStarts.has(r.position) && r.position !== at && 'border-b-2 border-b-accent'
								]}
								onmouseenter={() => (at = r.position)}
								onfocus={() => (at = r.position)}>{r.ch === ' ' ? '·' : r.ch}</button
							>
						</td>
					{/each}
				</tr>
				<tr>
					<th class="pr-3 text-left font-normal whitespace-nowrap text-muted">位置</th>
					{#each rows as r (r.position)}<td class="text-center text-[10.5px] text-muted tnum">{r.position}</td>{/each}
				</tr>
				<tr>
					<th class="pr-3 text-left font-normal whitespace-nowrap text-c-src">lookup</th>
					{#each rows as r (r.position)}<td class="text-center tnum">{r.kernel ?? '–'}</td>{/each}
				</tr>
				<tr>
					<th class="pr-3 text-left font-normal whitespace-nowrap text-c-gen">source map</th>
					{#each rows as r (r.position)}
						<td class={['text-center tnum', r.kernel !== r.consumer && 'bg-accent-wash text-accent']}>{r.consumer ?? '–'}</td>
					{/each}
				</tr>
			</tbody>
		</table>
		<p class="mt-3 font-mono text-[12.5px] tracking-normal">
			<span class="text-muted">src =</span>
			{#each Array.from(source) as ch, i (i)}<span
					class={[
						'inline-block w-[1.2em] text-center',
						i === row.kernel && 'bg-c-src text-bg',
						i === row.consumer && i !== row.kernel && 'outline outline-1 outline-c-gen'
					]}>{ch}</span
				>{/each}
		</p>
		<p class="mt-2 font-mono text-[12px] tracking-normal text-muted">
			{rows.length} 文字のうち食い違い <span class={differ > 0 ? 'text-accent' : 'text-fg'}>{differ}</span> · セグメント
			{segments.length} 個
		</p>
		{#if !coarse}
			<p class="mt-1 font-mono text-[12px] tracking-normal break-all text-muted">source_map = {map}</p>
		{/if}
	</div>
	{#snippet caption()}
		上の段は生成した文字列、橙の下線はセグメントの位置、下の二段はその文字の元の位置です。<span class="c-src">lookup</span>
		はコピーの内側を 1 対 1 に写します。<span class="c-gen">source map</span> は、書き出した 構造化データ形式
		を標準的な読み方（同じ行で、その列以前の最後のセグメント）で読んだ答えです。「Mapping ごと」は Mapping
		一つにつき一セグメントしか書かなかった場合で、コピーの内側がコピーの先頭に写ります。値は移植した Emitter で計算し、今の実装の source
		map の文字列が Rust の出力と一致することはテストで確かめています。
	{/snippet}
</Figure>
