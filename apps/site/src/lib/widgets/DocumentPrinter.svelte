<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Figure from '$lib/components/Figure.svelte';
	import SpanRuler from '$lib/components/SpanRuler.svelte';
	import { bilingual, type Lang } from '$lib/i18n';
	import { initializeDocumentPrinter, renderDocument, stringWidth, type TraceEvent } from '$lib/kernel/document-browser';
	import { readerLang } from '$lib/lang.svelte';

	// A preset is shared text, or text in both languages when it holds reader text.
	type Text = string | Record<Lang, string>;
	interface Preset {
		name: Text;
		source: Text;
		width?: number;
	}

	let { presets, label, tall = false }: { presets: Preset[]; label: string; tall?: boolean } = $props();

	const inReaderLang = (text: Text) => (typeof text === 'string' ? text : text[readerLang()]);
	const shown = $derived(presets.map((p) => ({ name: inReaderLang(p.name), source: inReaderLang(p.source), width: p.width })));

	// The first preset is where the figure starts, also on the server; later preset changes are the reader's.
	let source = $state(untrack(() => shown[0].source));
	let width = $state(untrack(() => presets[0].width ?? 40));
	let tabs = $state(false);
	let wasmReady = $state(false);
	let wasmError = $state<string | null>(null);

	onMount(() => {
		initializeDocumentPrinter()
			.then(() => (wasmReady = true))
			.catch((error: unknown) => {
				wasmError = error instanceof Error ? error.message : String(error);
			});
	});

	const result = $derived(wasmReady ? renderDocument(source, width, tabs) : null);
	const lines = $derived(result?.ok ? result.output.split('\n') : []);
	const trace: TraceEvent[] = $derived(result?.trace ?? []);
	const origin = $derived(new Map(result?.origins ?? []));
	const snippet = (layoutInstructionIdentifier: number) => {
		const at = origin.get(layoutInstructionIdentifier);
		return at === undefined ? `#${layoutInstructionIdentifier}` : source.slice(at, at + 22).replace(/\s+/g, ' ') + (source.length > at + 22 ? '…' : '');
	};
	const text = bilingual(
		{
			why: {
				fits: '平らで収まる',
				'does-not-fit': '収まらない',
				broken: '強制的に改行（hardline、literal line、breakParent、改行すると決めた group を含む）',
				'parent-flat': '親が平らなのでそのまま'
			},
			width: '幅',
			tabs: 'タブ',
			document: '文書（整形指示を書く小さな言語）',
			at: (offset: number) => `（位置 ${offset}）`,
			output: '出力',
			ruler: '列の目盛り',
			column: '列',
			wasmFailed: 'WebAssembly の初期化に失敗しました: ',
			wasmLoading: 'WebAssembly を読み込んでいます…',
			refused: 'Refused: flat_only のレイアウトが幅に収まりません',
			decision: '判断',
			node: 'ノード',
			position: '位置',
			remaining: '残り',
			result: '結果',
			content: '内容',
			separator: '区切り',
			hardlineInFlat: '平らなモードで hardline を出力した',
			remeasureNext: '次の group で測り直す',
			captionBefore: 'Rust の ',
			captionMiddle: ' を WebAssembly としてそのまま動かしています。下の表は、プリンタが group と fill でした判断を順に並べたものです。幅を動かすと、どこで ',
			captionAfter: ' の答えが変わるかが分かります。'
		},
		{
			why: {
				fits: 'fits when flat',
				'does-not-fit': 'does not fit',
				broken: 'forced break (contains a hardline, literal line, breakParent, or a group built broken)',
				'parent-flat': 'parent is flat, so it stays flat'
			},
			width: 'Width',
			tabs: 'Tabs',
			document: 'Document (a small language for writing layout instructions)',
			at: (offset: number) => ` (at offset ${offset})`,
			output: 'Output',
			ruler: 'Column ruler',
			column: 'columns',
			wasmFailed: 'WebAssembly failed to start: ',
			wasmLoading: 'Loading WebAssembly…',
			refused: 'Refused: the flat_only layout does not fit in the width',
			decision: 'Decision',
			node: 'Node',
			position: 'Position',
			remaining: 'Remaining',
			result: 'Result',
			content: 'content',
			separator: 'separator',
			hardlineInFlat: 'printed a hardline in flat mode',
			remeasureNext: 'measure again at the next group',
			captionBefore: 'This figure runs the Rust module ',
			captionMiddle:
				' as WebAssembly, without changes. The table below lists, in order, each decision that the printer made for a group or a fill. Change the width to see where ',
			captionAfter: ' changes its answer.'
		}
	);
	const t = $derived(text[readerLang()]);
</script>

<Figure {label} wide>
	{#snippet controls()}
		{#each shown as p (p.name)}
			<button
				type="button"
				class="btn-ghost"
				aria-pressed={source === p.source}
				onclick={() => ((source = p.source), (width = p.width ?? width))}>{p.name}</button
			>
		{/each}
		<label class="flex items-center gap-2 font-mono text-[12px] tracking-normal text-fg-2">
			{t.width} <span class="w-6 text-right tnum">{width}</span>
			<input class="range w-28" type="range" min="4" max="100" bind:value={width} />
		</label>
		<button type="button" class="btn-ghost" aria-pressed={tabs} onclick={() => (tabs = !tabs)}>{t.tabs}</button>
	{/snippet}
	<div class="grid lg:grid-cols-2">
		<div class="min-w-0 border-b border-line p-4 lg:border-r lg:border-b-0">
			<label class="mb-1.5 block font-mono text-[12px] tracking-normal text-muted" for="layoutInstructionIdentifier-src-{label}">{t.document}</label>
			<textarea
				id="layoutInstructionIdentifier-src-{label}"
				class={['field resize-y', tall ? 'h-72' : 'h-40']}
				bind:value={source}
				spellcheck="false"
			></textarea>
			{#if result && !result.ok && !result.refused}
				<p class="mt-2 font-mono text-[12px] tracking-normal text-warn">
					{result.message}{'at' in result ? t.at(result.at) : ''}
				</p>
			{/if}
		</div>
		<div class="min-w-0 p-4">
			<div class="mb-1 font-mono text-[12px] tracking-normal text-muted">{t.output}</div>
			<div class="relative overflow-x-auto">
				<div class="min-w-full" style:width="calc({Math.max(width, ...lines.map(stringWidth))}ch + 8px)">
					<div class="font-mono text-[13px]" style:width="{width}ch">
						<SpanRuler title={t.ruler} length={width} unit={t.column} tick={4} label={20} />
					</div>
					<pre
						class="relative mt-1 overflow-visible border-r border-dashed border-line-strong text-[13px] leading-[1.65]"
						style:width="{width}ch"
						style:tab-size={2}>{#if wasmError}<span class="text-warn">{t.wasmFailed}{wasmError}</span
						>{:else if !result}<span class="text-muted">{t.wasmLoading}</span
						>{:else if result.ok}{#each lines as l, i (i)}<span
									class={['block', stringWidth(l.replace(/\t/g, '  ')) > width && 'text-warn']}>{l || ' '}</span
								>{/each}{:else if result.refused}<span class="text-warn">{t.refused}</span
							>{/if}</pre>
				</div>
			</div>
		</div>
	</div>
	{#if trace.length > 0}
		<div class="max-h-56 overflow-auto border-t border-line bg-surface">
			<table class="table text-[12.5px]">
				<thead>
					<tr><th class="pl-4">#</th><th>{t.decision}</th><th>{t.node}</th><th class="num">{t.position}</th><th class="num">{t.remaining}</th><th>{t.result}</th></tr>
				</thead>
				<tbody class="font-mono tracking-normal">
					{#each trace as e, i (i)}
						<tr>
							<td class="pl-4 text-muted tnum">{i + 1}</td>
							{#if e.kind === 'group'}
								<td>group</td>
								<td class="text-fg-2">{snippet(e.layoutInstructionIdentifier)}</td>
								<td class="num">{e.position}</td>
								<td class="num">{e.remainingWidth}</td>
								<td><span class={e.mode === 'break' ? 'text-accent' : ''}>{e.mode}</span> <span class="text-muted">· {t.why[e.why]}</span></td>
							{:else if e.kind === 'fill'}
								<td>fill</td>
								<td class="text-fg-2">{snippet(e.layoutInstructionIdentifier)}</td>
								<td class="num">{e.position}</td>
								<td class="num"></td>
								<td>
									{t.content} {e.contentFits ? 'flat' : 'break'}{#if e.separatorFits !== null}
										· {t.separator} <span class={e.separatorFits ? '' : 'text-accent'}>{e.separatorFits ? 'flat' : 'break'}</span>{/if}
								</td>
							{:else if e.kind === 'refused'}
								<td>flat_only</td>
								<td class="text-fg-2">{snippet(e.layoutInstructionIdentifier)}</td>
								<td class="num">{e.position}</td>
								<td class="num"></td>
								<td class="text-warn">Refused</td>
							{:else}
								<td>remeasure</td>
								<td class="text-fg-2">{t.hardlineInFlat}</td>
								<td class="num">{e.position}</td>
								<td class="num"></td>
								<td class="text-muted">{t.remeasureNext}</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	{#snippet caption()}
		{t.captionBefore}<code>rsvelte_kernel::output::document</code>{t.captionMiddle}<code>fits</code>{t.captionAfter}
	{/snippet}
</Figure>
