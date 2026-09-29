<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { TOOLBAR as d, type Range } from '$lib/data/layers';

	type Focus =
		| { kind: 'surface'; id: number }
		| { kind: 'hir'; row: number }
		| { kind: 'binding'; id: number }
		| { kind: 'lint'; index: number }
		| null;

	let focus: Focus = $state({ kind: 'hir', row: d.hir.findIndex((r) => r.label.startsWith('If')) });

	// A focused HIR row lights its origin; a focused surface row lights every HIR row built from it.
	const surfaceLit = $derived.by(() => {
		if (focus?.kind === 'surface') return new Set([focus.id]);
		if (focus?.kind === 'hir') {
			const o = d.hir[focus.row].origin;
			return new Set(o === null ? [] : [o]);
		}
		return new Set<number>();
	});
	const hirLit = $derived.by(() => {
		if (focus?.kind === 'hir') return new Set([focus.row]);
		if (focus?.kind === 'surface') {
			const id = focus.id;
			return new Set(d.hir.flatMap((r, i) => (r.origin === id ? [i] : [])));
		}
		return new Set<number>();
	});
	const spans = $derived.by((): { span: Range; tone: 'node' | 'decl' | 'ref' }[] => {
		if (!focus) return [];
		if (focus.kind === 'surface') {
			const r = d.ast.find((x) => x.id === (focus as { id: number }).id);
			return r ? [{ span: r.span, tone: 'node' }] : [];
		}
		if (focus.kind === 'hir') return [{ span: d.hir[focus.row].span, tone: 'node' }];
		if (focus.kind === 'lint') return [{ span: d.lint[focus.index].span, tone: 'node' }];
		const b = d.bindings.find((x) => x.id === (focus as { id: number }).id)!;
		return [
			{ span: b.span, tone: 'decl' },
			...d.refs.filter((r) => r.binding === b.id).map((r) => ({ span: r.span, tone: 'ref' as const }))
		];
	});

	// The source as runs of characters that share a highlight, so each run is one element.
	const runs = $derived.by(() => {
		const tone = new Array<string>(d.src.length).fill('');
		// Wider spans first, so a nested span (a reference inside a node) wins where they overlap.
		for (const s of [...spans].sort((a, b) => b.span[1] - b.span[0] - (a.span[1] - a.span[0])))
			for (let i = s.span[0]; i < s.span[1]; i++) tone[i] = s.tone;
		const out: { text: string; tone: string }[] = [];
		for (let i = 0; i < d.src.length; i++) {
			const last = out.at(-1);
			if (last && last.tone === tone[i]) last.text += d.src[i];
			else out.push({ text: d.src[i], tone: tone[i] });
		}
		return out;
	});

	const refCount = (id: number) => d.refs.filter((r) => r.binding === id).length;
	const toneClass: Record<string, string> = {
		node: 'bg-accent-wash text-fg',
		decl: 'bg-c-map text-bg',
		ref: 'outline outline-1 outline-c-map'
	};
</script>

<Figure label="図 5.1 · 一つのコンポーネントの層" wide>
	<div class="border-b border-line p-4">
		<div class="mb-2 font-mono text-[11.5px] tracking-normal text-muted">Toolbar.svelte</div>
			<pre class="overflow-x-auto font-mono text-[12px] leading-[1.65] tracking-normal text-fg-2">{#each runs as r, i (i)}<span
						class={toneClass[r.tone]}>{r.text}</span
					>{/each}</pre>
	</div>
	<div class="grid border-b border-line md:grid-cols-2">
		<div class="min-w-0 border-b border-line p-4 md:border-r md:border-b-0">
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-c-src">表層の木（ast）</div>
			<ul class="font-mono text-[12px] leading-[1.9] tracking-normal">
				{#each d.ast as r, i (i)}
					<li style:padding-left="{r.depth * 12}px">
						{#if r.id === null}
							<span class="text-muted">{r.label}</span>
						{:else}
							<button
								type="button"
								class={[
									'rounded-xs px-1 text-left',
									surfaceLit.has(r.id) ? 'bg-c-src text-bg' : 'hover:bg-surface'
								]}
								onmouseenter={() => (focus = { kind: 'surface', id: r.id! })}
								onfocus={() => (focus = { kind: 'surface', id: r.id! })}
								><span class={surfaceLit.has(r.id) ? '' : 'text-muted'}>{r.id}</span> {r.label}</button
							>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
		<div class="min-w-0 p-4">
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-c-gen">HIR</div>
			<ul class="font-mono text-[12px] leading-[1.9] tracking-normal">
				{#each d.hir as r, i (i)}
					<li style:padding-left="{r.depth * 12}px">
						<button
							type="button"
							class={['rounded-xs px-1 text-left', hirLit.has(i) ? 'bg-c-gen text-bg' : 'hover:bg-surface']}
							onmouseenter={() => (focus = { kind: 'hir', row: i })}
							onfocus={() => (focus = { kind: 'hir', row: i })}
						>
							{#if r.id !== null}<span class={hirLit.has(i) ? '' : 'text-muted'}>{r.id}</span>{/if}
							{r.label}
							{#if r.origin !== null}<span class={hirLit.has(i) ? '' : 'text-muted'}>← {r.origin}</span>{/if}
						</button>
						{#each r.attrs ?? [] as a (a.name)}
							<div class="pl-5 text-[11.5px] leading-[1.6] text-muted">{a.name}: {a.value}</div>
						{/each}
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="grid md:grid-cols-2">
		<div class="min-w-0 border-b border-line p-4 md:border-r md:border-b-0">
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-c-map">名前解決（束縛）</div>
			<table class="w-full font-mono text-[12px] tracking-normal">
				<thead class="text-left text-muted">
					<tr><th class="font-normal">名前</th><th class="font-normal">宣言</th><th class="font-normal">rune</th><th class="text-right font-normal">参照</th></tr>
				</thead>
				<tbody>
					{#each d.bindings as b (b.id)}
						<tr
							class={focus?.kind === 'binding' && focus.id === b.id ? 'bg-surface' : ''}
							onmouseenter={() => (focus = { kind: 'binding', id: b.id })}
						>
							<td class="py-0.5">
								<button type="button" class="hover:text-accent" onfocus={() => (focus = { kind: 'binding', id: b.id })}>{b.name}</button>
							</td>
							<td>{b.decl}</td>
							<td>{b.rune}</td>
							<td class="text-right tnum" title="テンプレートからの参照 / 読み取りの合計">{refCount(b.id)} / {b.reads}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="min-w-0 p-4">
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-muted">lint の指摘</div>
			<ul class="space-y-1 font-mono text-[12px] tracking-normal">
				{#each d.lint as f, i (i)}
					<li>
						<button
							type="button"
							class={['text-left', focus?.kind === 'lint' && focus.index === i ? 'text-fg' : 'text-fg-2 hover:text-fg']}
							onmouseenter={() => (focus = { kind: 'lint', index: i })}
							onfocus={() => (focus = { kind: 'lint', index: i })}
						>
							<span class={f.layer === 'early' ? 'text-c-src' : 'text-c-gen'}>{f.layer}</span>
							{f.rule} — {f.message}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	{#snippet caption()}
		行にポインタを重ねると、対応する位置がつながります。<span class="c-gen">HIR</span> の <code>← n</code> は、その節点を作った<span
			class="c-src">表層の節点</span
		>の番号です。<code>{'{:else if}'}</code> は表層では <code>alt</code> の中の <code>If</code> ですが、HIR では一つの
		<code>If</code> の枝になります。束縛にポインタを重ねると、宣言（塗り）とテンプレートからの参照（枠）が光ります。空白だけのテキスト節点は省いています。値はすべて
		Rust のパイプラインが出したもので、lint の二件は ESLint の出力と位置まで一致します。
	{/snippet}
</Figure>
