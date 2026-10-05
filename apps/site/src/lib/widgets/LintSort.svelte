<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { bilingual } from '$lib/i18n';
	import { LineIndex } from '$lib/kernel/source';
	import { readerLang } from '$lib/lang.svelte';

	const labels = bilingual(
		{
			label: '図 7.1 · 報告順と出力順',
			swap: 'ルールの順を入れ替え',
			document: '文書（x が指摘される）',
			reported: (order: string) => `ルールが報告した順（${order}）`,
			sorted: 'run の戻り値（start_offset で安定ソート）→ 行:列',
			caption: '同じ位置の指摘は、先に走ったルールのものが先に来ます。列は ESLint と同じく 1 から数えた ユニコードの16ビット符号化方式 の単位で、😀 のあとの x は 3 列目です。'
		},
		{
			label: 'Figure 7.1 · Report order and output order',
			swap: 'Swap the rule order',
			document: 'Document (each x is reported)',
			reported: (order: string) => `Order the rules reported (${order})`,
			sorted: 'Return value of run (stable sort by start_offset) → line:column',
			caption:
				'Findings at the same position keep the rule that ran first in front. As in ESLint, columns count UTF-16 code units (the encoding that JavaScript strings use) from 1, so the x after 😀 is in column 3.'
		}
	);
	const t = $derived(labels[readerLang()]);

	// The rsvelte_lint test's rule: report every 'x' (optionally shifted), under the rule's own id.
	interface Finding {
		code: string;
		startOffset: number;
		seq: number;
	}

	let text = $state('x.x\n😀x');
	let order = $state(['b', 'a']);

	const index = $derived(new LineIndex(text));
	const reported = $derived.by(() => {
		const out: Finding[] = [];
		for (const code of order) {
			index.chars().forEach((c) => {
				if (c.ch === 'x') out.push({ code, startOffset: c.byte, seq: out.length });
			});
		}
		return out;
	});
	// Array.prototype.sort is stable, like Rust's sort_by_key.
	const sorted = $derived([...reported].sort((p, q) => p.startOffset - q.startOffset));
	const position = (b: number) => {
		const lc = index.lineCol(b);
		return `${lc.line}:${lc.column + 1}`;
	};
</script>

<Figure label={t.label}>
	{#snippet controls()}
		<button type="button" class="btn-ghost" onclick={() => (order = [...order].reverse())}>{t.swap}</button>
	{/snippet}
	<div class="p-4">
		<label class="mb-1.5 block font-mono text-[12px] tracking-normal text-muted" for="lint-text">{t.document}</label>
		<textarea id="lint-text" class="field h-14 resize-y" bind:value={text} spellcheck="false"></textarea>
		<div class="mt-4 grid gap-6 font-mono text-[12.5px] tracking-normal sm:grid-cols-2">
			<div>
				<div class="text-muted">{t.reported(order.join(' → '))}</div>
				<ol class="mt-1.5 space-y-0.5">
					{#each reported as f (f.seq)}
						<li><span class={f.code === 'a' ? 'text-c-src' : 'text-c-gen'}>{f.code}</span> @ {f.startOffset}</li>
					{/each}
				</ol>
			</div>
			<div>
				<div class="text-muted">{t.sorted}</div>
				<ol class="mt-1.5 space-y-0.5">
					{#each sorted as f (f.seq)}
						<li>
							<span class={f.code === 'a' ? 'text-c-src' : 'text-c-gen'}>{f.code}</span> @ {f.startOffset}
							<span class="text-muted">→ {position(f.startOffset)}</span>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</div>
	{#snippet caption()}
		{t.caption}
	{/snippet}
</Figure>
