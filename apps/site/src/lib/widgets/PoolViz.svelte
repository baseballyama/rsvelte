<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { bilingual } from '$lib/i18n';
	import { simulate } from '$lib/kernel/pool-sim';
	import { readerLang } from '$lib/lang.svelte';

	const sizes = [120, 80, 300, 90, 110, 95];
	let enabled = $state(true);
	let tight = $state(false);
	let step = $state(0);
	// The control of e8eef831d3 shrank the budget until it bound; here, below one lowered tree.
	const TIGHT = 400;

	const text = bilingual(
		{
			label: '図 12.1 · 1 ワーカー、1 つの鍵',
			withPool: 'pool あり',
			withoutPool: 'pool なし',
			budget: (n: number) => `予算 ${n}`,
			previous: '前へ',
			next: '次へ',
			doc: (doc: number, nodes: number) => `文書 ${doc}（ノード ${nodes}）·`,
			taken: (got: number | null, need: number) => `${got === null ? '空の Vec' : `容量 ${got} を再利用`}、${need} 要素まで伸ばす:`,
			allocations: (n: number) => `確保 ${n} 回`,
			given: (cap: number) => `容量 ${cap} →`,
			kept: 'プールへ',
			overBudget: '予算を超えるので解放',
			full: '保存先が満杯なので解放',
			freed: '解放',
			pool: 'プール（上が次に出る）',
			empty: '空',
			soFar: 'ここまでの確保',
			total: (all: number, withPool: boolean, otherAll: number) => `最後まで: ${all}（${withPool ? 'pool なし' : 'pool あり'}なら ${otherAll}）`,
			captionBefore: '模型です。',
			captionMiddle:
				' の列の一つ（一つの鍵）だけを追います。順序は実際の Svelte プラグインと同じで、パースした木は文書の終わりまで生き、compile の各ターゲットが作る木は出力のあとに落ちます。ノード数と、lower した木がパースの 1.6 倍・1.3 倍になるという比は例示です。「予算」は要素の数で数えていますが、本物の ',
			captionAfter: ' はスレッドのすべての鍵を合わせたバイト数（64 MiB）です。'
		},
		{
			label: 'Figure 12.1 · One worker, one key',
			withPool: 'With pool',
			withoutPool: 'Without pool',
			budget: (n: number) => `Budget ${n}`,
			previous: 'Previous',
			next: 'Next',
			doc: (doc: number, nodes: number) => `Document ${doc} (${nodes} nodes) —`,
			taken: (got: number | null, need: number) =>
				`${got === null ? 'empty Vec' : `reuses capacity ${got}`}, grows to ${need} elements:`,
			allocations: (n: number) => (n === 1 ? '1 allocation' : `${n} allocations`),
			given: (cap: number) => `capacity ${cap} →`,
			kept: 'to the pool',
			overBudget: 'freed because it is over the budget',
			full: 'freed because the slot is full',
			freed: 'freed',
			pool: 'Pool (the top one comes out next)',
			empty: 'Empty',
			soFar: 'Allocations so far',
			total: (all: number, withPool: boolean, otherAll: number) =>
				`At the end: ${all} (${otherAll} ${withPool ? 'without the pool' : 'with the pool'})`,
			captionBefore: 'This is a model. It follows only one column (one key) of ',
			captionMiddle:
				'. The order is the same as in the real Svelte plugin: the parsed tree lives until the document ends, and the tree that each compile target builds is dropped after printing. The node counts and the ratios of a lowered tree to the parsed tree (1.6 and 1.3) are examples. The budget here counts elements, but the real ',
			captionAfter: ' counts the bytes of all keys of the thread together (64 mebibytes).'
		}
	);
	const t = $derived(text[readerLang()]);

	const budget = $derived(tight ? TIGHT : Infinity);
	const steps = $derived(simulate(sizes, enabled, budget));
	const other = $derived(simulate(sizes, !enabled, budget));
	const cur = $derived(steps[Math.min(step, steps.length - 1)]);
	const maxCap = $derived(Math.max(...steps.flatMap((s) => [...s.pool, s.event.kind === 'take' ? s.event.cap : s.event.cap])));
</script>

<Figure label={t.label} wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={enabled} onclick={() => (enabled = true)}>{t.withPool}</button>
		<button type="button" class="btn-ghost" aria-pressed={!enabled} onclick={() => (enabled = false)}>{t.withoutPool}</button>
		<button type="button" class="btn-ghost" aria-pressed={tight} onclick={() => (tight = !tight)}>{t.budget(TIGHT)}</button>
		<button type="button" class="btn-ghost" onclick={() => (step = Math.max(0, step - 1))} disabled={step === 0} aria-label={t.previous}>◀</button>
		<span class="font-mono text-[12px] tracking-normal text-muted tnum">{step + 1}/{steps.length}</span>
		<button type="button" class="btn-ghost" onclick={() => (step = Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1} aria-label={t.next}>▶</button>
	{/snippet}
	<div class="grid gap-0 md:grid-cols-[minmax(0,1fr)_220px]">
		<div class="min-w-0 border-b border-line p-4 md:border-r md:border-b-0">
			<div class="font-mono text-[12.5px] tracking-normal">
				<span class="text-muted">{t.doc(cur.doc + 1, sizes[cur.doc])}</span>
				{#if cur.event.kind === 'take'}
					take() for <span class="text-c-src">{cur.event.syntax_tree}</span> →
					{t.taken(cur.event.got, cur.event.need)}
					<span class={cur.event.allocations ? 'text-accent' : ''}>{t.allocations(cur.event.allocations)}</span>
				{:else}
					give() from <span class="text-c-src">{cur.event.syntax_tree}</span> {t.given(cur.event.cap)}
					{cur.event.kept ? t.kept : cur.event.why === 'budget' ? t.overBudget : cur.event.why === 'full' ? t.full : t.freed}
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
			<div class="text-muted">{t.pool}</div>
			<div class="mt-2 flex min-h-24 flex-col-reverse gap-1">
				{#each cur.pool as cap, i (i)}
					<div class="flex items-center gap-2">
						<div class="h-3 bg-c-gen" style:width="{Math.max((cap / maxCap) * 150, 3)}px"></div>
						<span class="tnum text-fg-2">{cap}</span>
					</div>
				{:else}
					<span class="text-muted">{t.empty}</span>
				{/each}
			</div>
			<div class="mt-4 text-muted">{t.soFar}</div>
			<div class="text-[18px] tnum">{cur.allocations}</div>
			<div class="mt-2 text-muted">{t.total(steps.at(-1)!.allocations, enabled, other.at(-1)!.allocations)}</div>
		</div>
	</div>
	{#snippet caption()}
		{t.captionBefore}<code>rsvelte_typescript::SyntaxTree</code>{t.captionMiddle}<code>MAXIMUM_BYTES</code>{t.captionAfter}
	{/snippet}
</Figure>
