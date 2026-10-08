<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { TOOLBAR as d, type Range } from '$lib/data/layers';
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';

	const text = bilingual(
		{
			label: '図 5.1 · Svelte の構文木と解析結果の例',
			surface: '元の構文木（syntax_tree）',
			compiled: 'コンパイル用に整理した構文木',
			bindings: '名前解決（束縛）',
			name: '名前',
			declaration: '宣言',
			references: '参照',
			referencesTitle: 'テンプレートからの参照 / 読み取りの合計',
			lint: 'lint の指摘',
			hover: '行にポインタを重ねると、対応する位置がつながります。',
			tree: 'コンパイル用に整理した構文木',
			of: ' の ',
			origin: ' は、その要素を作った',
			surfaceElement: '元の構文木の要素',
			number: 'の番号です。',
			elseIf: ' は表層では ',
			inside: ' の中の ',
			branch: ' ですが、コンパイル用に整理した構文木では一つの ',
			rest: ' の枝になります。束縛にポインタを重ねると、宣言（塗り）とテンプレートからの参照（枠）が光ります。空白だけのテキスト要素は省いています。値はすべて Rust のパイプラインが出したもので、lint の二件は ESLint の出力と位置まで一致します。'
		},
		{
			label: 'Figure 5.1 · An example of a Svelte syntax tree and its analysis results',
			surface: 'Original syntax tree (syntax_tree)',
			compiled: 'Syntax tree arranged for compiling',
			bindings: 'Name resolution (bindings)',
			name: 'name',
			declaration: 'declaration',
			references: 'references',
			referencesTitle: 'References from the template / total reads',
			lint: 'Lint findings',
			hover: 'Point at a row to connect the matching positions. In the ',
			tree: 'syntax tree arranged for compiling',
			of: ', ',
			origin: ' is the number of the ',
			surfaceElement: 'original syntax tree element',
			number: ' that the element was built from. In the surface layer, ',
			elseIf: ' sits inside ',
			inside: ' as an ',
			branch: ', but in the syntax tree arranged for compiling it becomes a branch of one ',
			rest: '. Point at a binding to light up its declaration (filled) and its references from the template (outlined). Text elements that hold only whitespace are left out. Every value comes from the Rust pipeline, and the two lint findings match the output of ESLint, positions included.'
		}
	);
	const t = $derived(text[readerLang()]);

	type Tone = '' | 'node' | 'declaration' | 'ref';

	type Focus =
		| { kind: 'surface'; id: number }
		| { kind: 'compiler_syntax_tree'; row: number }
		| { kind: 'binding'; id: number }
		| { kind: 'lint'; index: number }
		| null;

	let focus: Focus = $state({ kind: 'compiler_syntax_tree', row: d.compiler_syntax_tree.findIndex((r) => r.label.startsWith('If')) });

	// A focused HIR row lights its origin; a focused surface row lights every HIR row built from it.
	const surfaceLit = $derived.by(() => {
		if (focus?.kind === 'surface') return new Set([focus.id]);
		if (focus?.kind === 'compiler_syntax_tree') {
			const o = d.compiler_syntax_tree[focus.row].origin;
			return new Set(o === null ? [] : [o]);
		}
		return new Set<number>();
	});
	const compilerSyntaxTreeLit = $derived.by(() => {
		if (focus?.kind === 'compiler_syntax_tree') return new Set([focus.row]);
		if (focus?.kind === 'surface') {
			const id = focus.id;
			return new Set(d.compiler_syntax_tree.flatMap((r, i) => (r.origin === id ? [i] : [])));
		}
		return new Set<number>();
	});
	const spans = $derived.by((): { span: Range; tone: Exclude<Tone, ''> }[] => {
		if (!focus) return [];
		if (focus.kind === 'surface') {
			const r = d.syntax_tree.find((x) => x.id === (focus as { id: number }).id);
			return r ? [{ span: r.span, tone: 'node' }] : [];
		}
		if (focus.kind === 'compiler_syntax_tree') return [{ span: d.compiler_syntax_tree[focus.row].span, tone: 'node' }];
		if (focus.kind === 'lint') return [{ span: d.lint[focus.index].span, tone: 'node' }];
		const b = d.bindings.find((x) => x.id === (focus as { id: number }).id)!;
		return [
			{ span: b.span, tone: 'declaration' },
			...d.refs.filter((r) => r.binding === b.id).map((r) => ({ span: r.span, tone: 'ref' as const }))
		];
	});

	// The source as runs of characters that share a highlight, so each run is one element.
	const runs = $derived.by(() => {
		const tone = new Array<Tone>(d.source.length).fill('');
		// Wider spans first, so a nested span (a reference inside a node) wins where they overlap.
		for (const s of [...spans].sort((a, b) => b.span[1] - b.span[0] - (a.span[1] - a.span[0])))
			for (let i = s.span[0]; i < s.span[1]; i++) tone[i] = s.tone;
		const out: { text: string; tone: Tone }[] = [];
		for (let i = 0; i < d.source.length; i++) {
			const last = out.at(-1);
			if (last && last.tone === tone[i]) last.text += d.source[i];
			else out.push({ text: d.source[i], tone: tone[i] });
		}
		return out;
	});

	const refCount = (id: number) => d.refs.filter((r) => r.binding === id).length;
	const toneClass: Record<Tone, string> = {
		'': '',
		node: 'bg-accent-wash text-fg',
		declaration: 'bg-c-map text-bg',
		ref: 'outline outline-1 outline-c-map'
	};
</script>

<Figure label={t.label} wide>
	<div class="border-b border-line p-4">
		<div class="mb-2 font-mono text-[11.5px] tracking-normal text-muted">Toolbar.svelte</div>
			<pre class="overflow-x-auto font-mono text-[12px] leading-[1.65] tracking-normal text-fg-2">{#each runs as r, i (i)}<span
						class={toneClass[r.tone]}>{r.text}</span
					>{/each}</pre>
	</div>
	<div class="grid border-b border-line md:grid-cols-2">
		<div class="min-w-0 border-b border-line p-4 md:border-r md:border-b-0">
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-c-src">{t.surface}</div>
			<ul class="font-mono text-[12px] leading-[1.9] tracking-normal">
				{#each d.syntax_tree as r, i (i)}
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
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-c-gen">{t.compiled}</div>
			<ul class="font-mono text-[12px] leading-[1.9] tracking-normal">
				{#each d.compiler_syntax_tree as r, i (i)}
					<li style:padding-left="{r.depth * 12}px">
						<button
							type="button"
							class={['rounded-xs px-1 text-left', compilerSyntaxTreeLit.has(i) ? 'bg-c-gen text-bg' : 'hover:bg-surface']}
							onmouseenter={() => (focus = { kind: 'compiler_syntax_tree', row: i })}
							onfocus={() => (focus = { kind: 'compiler_syntax_tree', row: i })}
						>
							{#if r.id !== null}<span class={compilerSyntaxTreeLit.has(i) ? '' : 'text-muted'}>{r.id}</span>{/if}
							{r.label}
							{#if r.origin !== null}<span class={compilerSyntaxTreeLit.has(i) ? '' : 'text-muted'}>← {r.origin}</span>{/if}
						</button>
						{#each r.attributes ?? [] as a (a.name)}
							<div class="pl-5 text-[11.5px] leading-[1.6] text-muted">{a.name}: {a.value}</div>
						{/each}
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="grid md:grid-cols-2">
		<div class="min-w-0 border-b border-line p-4 md:border-r md:border-b-0">
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-c-map">{t.bindings}</div>
			<table class="w-full font-mono text-[12px] tracking-normal">
				<thead class="text-left text-muted">
					<tr><th class="font-normal">{t.name}</th><th class="font-normal">{t.declaration}</th><th class="font-normal">rune</th><th class="text-right font-normal">{t.references}</th></tr>
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
							<td>{b.declaration}</td>
							<td>{b.rune}</td>
							<td class="text-right tnum" title={t.referencesTitle}>{refCount(b.id)} / {b.reads}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="min-w-0 p-4">
			<div class="mb-2 font-mono text-[11.5px] tracking-normal text-muted">{t.lint}</div>
			<ul class="space-y-1 font-mono text-[12px] tracking-normal">
				{#each d.lint as f, i (i)}
					<li>
						<button
							type="button"
							class={['text-left', focus?.kind === 'lint' && focus.index === i ? 'text-fg' : 'text-fg-2 hover:text-fg']}
							onmouseenter={() => (focus = { kind: 'lint', index: i })}
							onfocus={() => (focus = { kind: 'lint', index: i })}
						>
							{f.rule} — {f.message}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	{#snippet caption()}
		{t.hover}<span class="c-gen">{t.tree}</span>{t.of}<code>← n</code>{t.origin}<span class="c-src"
			>{t.surfaceElement}</span
		>{t.number}<code>{'{:else if}'}</code>{t.elseIf}<code>alternate</code>{t.inside}<code>If</code>{t.branch}<code
			>If</code
		>{t.rest}
	{/snippet}
</Figure>
