<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { simulate } from '$lib/kernel/pool-sim';

	const sizes = [120, 80, 300, 90, 110, 95];
	let enabled = $state(true);
	let tight = $state(false);
	let step = $state(0);
	// The control of e8eef831d3 shrank the budget until it bound; here, below one lowered tree.
	const TIGHT = 400;

	const budget = $derived(tight ? TIGHT : Infinity);
	const steps = $derived(simulate(sizes, enabled, budget));
	const other = $derived(simulate(sizes, !enabled, budget));
	const cur = $derived(steps[Math.min(step, steps.length - 1)]);
	const maxCap = $derived(Math.max(...steps.flatMap((s) => [...s.pool, s.event.kind === 'take' ? s.event.cap : s.event.cap])));
</script>

<Figure label="図 12.1 · 1 ワーカー、1 つの鍵" wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={enabled} onclick={() => (enabled = true)}>pool あり</button>
		<button type="button" class="btn-ghost" aria-pressed={!enabled} onclick={() => (enabled = false)}>pool なし</button>
		<button type="button" class="btn-ghost" aria-pressed={tight} onclick={() => (tight = !tight)}>予算 {TIGHT}</button>
		<button type="button" class="btn-ghost" onclick={() => (step = Math.max(0, step - 1))} disabled={step === 0} aria-label="前へ">◀</button>
		<span class="font-mono text-[12px] tracking-normal text-muted tnum">{step + 1}/{steps.length}</span>
		<button type="button" class="btn-ghost" onclick={() => (step = Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1} aria-label="次へ">▶</button>
	{/snippet}
	<div class="grid gap-0 md:grid-cols-[minmax(0,1fr)_220px]">
		<div class="min-w-0 border-b border-line p-4 md:border-r md:border-b-0">
			<div class="font-mono text-[12.5px] tracking-normal">
				<span class="text-muted">文書 {cur.doc + 1}（ノード {sizes[cur.doc]}）·</span>
				{#if cur.event.kind === 'take'}
					take() for <span class="text-c-src">{cur.event.syntax_tree}</span> →
					{cur.event.got === null ? '空の Vec' : `容量 ${cur.event.got} を再利用`}、{cur.event.need} 要素まで伸ばす:
					<span class={cur.event.allocations ? 'text-accent' : ''}>確保 {cur.event.allocations} 回</span>
				{:else}
					give() from <span class="text-c-src">{cur.event.syntax_tree}</span> 容量 {cur.event.cap} →
					{cur.event.kept ? 'プールへ' : cur.event.why === 'budget' ? '予算を超えるので解放' : cur.event.why === 'full' ? '保存先が満杯なので解放' : '解放'}
				{/if}
			</div>
			<ol class="mt-4 space-y-0.5 font-mono text-[11.5px] tracking-normal">
				{#each steps as s, i (i)}
					<li class="flex">
						<button
							type="button"
							class={['flex w-full gap-3 text-left', i === step ? 'text-fg' : i < step ? 'text-fg-2' : 'text-muted']}
							onclick={() => (step = i)}
						>
							<span class="w-10 tnum">doc {s.doc + 1}</span>
							<span class="w-10">{s.event.kind}</span>
							<span class="w-24">{s.event.syntax_tree}</span>
							<span class="tnum">{s.event.kind === 'take' ? `+${s.event.allocations}` : ''}</span>
						</button>
					</li>
				{/each}
			</ol>
		</div>
		<div class="p-4 font-mono text-[12px] tracking-normal">
			<div class="text-muted">プール（上が次に出る）</div>
			<div class="mt-2 flex min-h-24 flex-col-reverse gap-1">
				{#each cur.pool as cap, i (i)}
					<div class="flex items-center gap-2">
						<div class="h-3 bg-c-gen" style:width="{Math.max((cap / maxCap) * 150, 3)}px"></div>
						<span class="tnum text-fg-2">{cap}</span>
					</div>
				{:else}
					<span class="text-muted">空</span>
				{/each}
			</div>
			<div class="mt-4 text-muted">ここまでの確保</div>
			<div class="text-[18px] tnum">{cur.allocations}</div>
			<div class="mt-2 text-muted">最後まで: {steps.at(-1)!.allocations}（{enabled ? 'pool なし' : 'pool あり'}なら {other.at(-1)!.allocations}）</div>
		</div>
	</div>
	{#snippet caption()}
		模型です。<code>rsvelte_typescript::SyntaxTree</code> の列の一つ（一つの鍵）だけを追います。順序は実際の Svelte プラグインと同じで、パースした木は文書の終わりまで生き、compile
		の各ターゲットが作る木は出力のあとに落ちます。ノード数と、lower した木がパースの 1.6 倍・1.3 倍になるという比は例示です。「予算」は要素の数で数えていますが、本物の
		<code>MAXIMUM_BYTES</code> はスレッドのすべての鍵を合わせたバイト数（64 MiB）です。
	{/snippet}
</Figure>
