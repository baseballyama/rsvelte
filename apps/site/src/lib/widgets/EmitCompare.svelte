<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { consumerLookup, decodeMappings, Emitter } from '$lib/kernel/emit';

	// The kernel test `spans_map_back_through_copies_and_quotes`, step by step.
	const src = '<p aria-label={x}>';
	const e = new Emitter();
	e.push('f({ ');
	e.mark(3);
	e.push('"');
	e.copy(src, { lo: 3, hi: 13 });
	e.push('": ');
	e.copy(src, { lo: 15, hi: 16 });
	e.push(' });');

	const map = e.sourceMap(src, 'App.svelte');
	const segments = decodeMappings(JSON.parse(map).mappings);
	const rows = Array.from(e.out, (ch, pos) => {
		const k = e.lookup(pos);
		const c = consumerLookup(segments, 1, pos);
		return { ch, pos, kernel: k, consumer: c ? c.srcCol : null };
	});
	let at = $state(10);
	const row = $derived(rows[at]);
	const mappingStarts = new Set(e.mappings.map((m) => m.generated));
</script>

<Figure label="図 8.1 · lookup と source map の答え" wide>
	<div class="overflow-x-auto p-4">
		<table class="border-collapse font-mono text-[12.5px] tracking-normal">
			<tbody>
				<tr>
					<th class="pr-3 text-left font-normal text-muted">generated</th>
					{#each rows as r (r.pos)}
						<td class="p-0">
							<button
								type="button"
								class={[
									'block w-[1.9em] border border-line py-1 text-center',
									r.pos === at ? 'bg-fg text-bg' : 'hover:bg-surface',
									mappingStarts.has(r.pos) && r.pos !== at && 'border-b-2 border-b-accent'
								]}
								onmouseenter={() => (at = r.pos)}
								onfocus={() => (at = r.pos)}>{r.ch === ' ' ? '·' : r.ch}</button
							>
						</td>
					{/each}
				</tr>
				<tr>
					<th class="pr-3 text-left font-normal text-muted">位置</th>
					{#each rows as r (r.pos)}<td class="text-center text-[10.5px] text-muted tnum">{r.pos}</td>{/each}
				</tr>
				<tr>
					<th class="pr-3 text-left font-normal text-c-src">lookup</th>
					{#each rows as r (r.pos)}<td class="text-center tnum">{r.kernel ?? '–'}</td>{/each}
				</tr>
				<tr>
					<th class="pr-3 text-left font-normal text-c-gen">source map</th>
					{#each rows as r (r.pos)}
						<td class={['text-center tnum', r.kernel !== r.consumer && 'bg-accent-wash text-accent']}>{r.consumer ?? '–'}</td>
					{/each}
				</tr>
			</tbody>
		</table>
		<p class="mt-3 font-mono text-[12.5px] tracking-normal">
			<span class="text-muted">src =</span>
			{#each Array.from(src) as ch, i (i)}<span
					class={[
						'inline-block w-[1.2em] text-center',
						i === row.kernel && 'bg-c-src text-bg',
						i === row.consumer && i !== row.kernel && 'outline outline-1 outline-c-gen'
					]}>{ch}</span
				>{/each}
		</p>
		<p class="mt-2 font-mono text-[12px] tracking-normal text-muted">
			source_map = {map}
		</p>
	</div>
	{#snippet caption()}
		上の段は生成した文字列、橙の下線は写像の始まり、下の二段はその文字の元の位置です。<span class="c-src">lookup</span>
		はコピーの内側を 1 対 1 に写し、<span class="c-gen">source map</span>（<code>source_map</code> が書いた JSON
		を標準的な方法で読んだもの）はコピーの先頭に写します。食い違う箇所に色を付けています。値は移植した Emitter で計算し、source
		map の文字列は Rust の出力と一致することをテストで確かめています。
	{/snippet}
</Figure>
