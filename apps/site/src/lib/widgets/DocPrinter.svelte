<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Figure from '$lib/components/Figure.svelte';
	import SpanRuler from '$lib/components/SpanRuler.svelte';
	import { initializeDocWasm, renderDoc, stringWidth, type TraceEvent } from '$lib/kernel/doc-wasm';

	interface Preset {
		name: string;
		src: string;
		width?: number;
	}

	let { presets, label, tall = false }: { presets: Preset[]; label: string; tall?: boolean } = $props();

	// The first preset is where the figure starts, also on the server; later preset changes are the reader's.
	let src = $state(untrack(() => presets[0].src));
	let width = $state(untrack(() => presets[0].width ?? 40));
	let tabs = $state(false);
	let wasmReady = $state(false);
	let wasmError = $state<string | null>(null);

	onMount(() => {
		initializeDocWasm()
			.then(() => (wasmReady = true))
			.catch((error: unknown) => {
				wasmError = error instanceof Error ? error.message : String(error);
			});
	});

	const result = $derived(wasmReady ? renderDoc(src, width, tabs) : null);
	const lines = $derived(result?.ok ? result.out.split('\n') : []);
	const trace: TraceEvent[] = $derived(result?.trace ?? []);
	const origin = $derived(new Map(result?.origins ?? []));
	const snippet = (doc: number) => {
		const at = origin.get(doc);
		return at === undefined ? `#${doc}` : src.slice(at, at + 22).replace(/\s+/g, ' ') + (src.length > at + 22 ? '…' : '');
	};
	const why: Record<string, string> = {
		fits: '平らで収まる',
		'does-not-fit': '収まらない',
		broken: '強制的に改行（hardline を含む）',
		'parent-flat': '親が平らなのでそのまま'
	};
</script>

<Figure {label} wide>
	{#snippet controls()}
		{#each presets as p (p.name)}
			<button
				type="button"
				class="btn-ghost"
				aria-pressed={src === p.src}
				onclick={() => ((src = p.src), (width = p.width ?? width))}>{p.name}</button
			>
		{/each}
		<label class="flex items-center gap-2 font-mono text-[12px] tracking-normal text-fg-2">
			幅 <span class="w-6 text-right tnum">{width}</span>
			<input class="range w-28" type="range" min="4" max="100" bind:value={width} />
		</label>
		<button type="button" class="btn-ghost" aria-pressed={tabs} onclick={() => (tabs = !tabs)}>タブ</button>
	{/snippet}
	<div class="grid lg:grid-cols-2">
		<div class="min-w-0 border-b border-line p-4 lg:border-r lg:border-b-0">
			<label class="mb-1.5 block font-mono text-[12px] tracking-normal text-muted" for="doc-src-{label}">文書（DSL）</label>
			<textarea
				id="doc-src-{label}"
				class={['field resize-y', tall ? 'h-72' : 'h-40']}
				bind:value={src}
				spellcheck="false"
			></textarea>
			{#if result && !result.ok && !result.refused}
				<p class="mt-2 font-mono text-[12px] tracking-normal text-warn">
					{result.message}{'at' in result ? `（${result.at} 文字目）` : ''}
				</p>
			{/if}
		</div>
		<div class="min-w-0 p-4">
			<div class="mb-1 font-mono text-[12px] tracking-normal text-muted">出力</div>
			<div class="relative overflow-x-auto">
				<div class="min-w-full" style:width="calc({Math.max(width, ...lines.map(stringWidth))}ch + 8px)">
					<div class="font-mono text-[13px]" style:width="{width}ch">
						<SpanRuler title="列の目盛り" length={width} unit="列" tick={4} label={20} />
					</div>
					<pre
						class="relative mt-1 overflow-visible border-r border-dashed border-line-strong text-[13px] leading-[1.65]"
						style:width="{width}ch"
						style:tab-size={2}>{#if wasmError}<span class="text-warn">WebAssembly の初期化に失敗しました: {wasmError}</span
						>{:else if !result}<span class="text-muted">WebAssembly を読み込んでいます…</span
						>{:else if result.ok}{#each lines as l, i (i)}<span
									class={['block', stringWidth(l.replace(/\t/g, '  ')) > width && 'text-warn']}>{l || ' '}</span
								>{/each}{:else if result.refused}<span class="text-warn">Refused: flat_only のレイアウトが幅に収まりません</span
							>{/if}</pre>
				</div>
			</div>
		</div>
	</div>
	{#if trace.length > 0}
		<div class="max-h-56 overflow-auto border-t border-line bg-surface">
			<table class="table text-[12.5px]">
				<thead>
					<tr><th class="pl-4">#</th><th>判断</th><th>ノード</th><th class="num">位置</th><th class="num">残り</th><th>結果</th></tr>
				</thead>
				<tbody class="font-mono tracking-normal">
					{#each trace as e, i (i)}
						<tr>
							<td class="pl-4 text-muted tnum">{i + 1}</td>
							{#if e.kind === 'group'}
								<td>group</td>
								<td class="text-fg-2">{snippet(e.doc)}</td>
								<td class="num">{e.pos}</td>
								<td class="num">{e.rem}</td>
								<td><span class={e.mode === 'break' ? 'text-accent' : ''}>{e.mode}</span> <span class="text-muted">· {why[e.why]}</span></td>
							{:else if e.kind === 'fill'}
								<td>fill</td>
								<td class="text-fg-2">{snippet(e.doc)}</td>
								<td class="num">{e.pos}</td>
								<td class="num"></td>
								<td>
									内容 {e.contentFits ? 'flat' : 'break'}{#if e.separatorFits !== null}
										· 区切り <span class={e.separatorFits ? '' : 'text-accent'}>{e.separatorFits ? 'flat' : 'break'}</span>{/if}
								</td>
							{:else if e.kind === 'refused'}
								<td>flat_only</td>
								<td class="text-fg-2">{snippet(e.doc)}</td>
								<td class="num">{e.pos}</td>
								<td class="num"></td>
								<td class="text-warn">Refused</td>
							{:else}
								<td>remeasure</td>
								<td class="text-fg-2">平らなモードで hardline を印字した</td>
								<td class="num">{e.pos}</td>
								<td class="num"></td>
								<td class="text-muted">次の group で測り直す</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	{#snippet caption()}
		Rust の <code>rsv_kernel::doc</code> を WebAssembly としてそのまま動かしています。下の表は、プリンタが group と fill でした判断を順に並べたものです。幅を動かすと、どこで
		<code>fits</code> の答えが変わるかが分かります。
	{/snippet}
</Figure>
