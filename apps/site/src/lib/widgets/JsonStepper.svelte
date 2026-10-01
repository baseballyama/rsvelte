<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { StructuredDataWriter } from '$lib/kernel/structured-data';

	let pretty = $state(true);
	let step = $state(0);

	// The calls of the kernel test `nested_values_and_keys` (compact half).
	const steps = $derived.by(() => {
		const w = new StructuredDataWriter(pretty);
		w.beginObject().key('a').num(1).key('b').beginArray().str('x\n').null().endArray().key('c').beginObject().endObject().endObject();
		return w.steps;
	});
	const cur = $derived(steps[Math.min(step, steps.length - 1)]);
</script>

<Figure label="図 10.1 · StructuredDataWriter の状態">
	{#snippet controls()}
		<button type="button" class="btn-ghost" aria-pressed={!pretty} onclick={() => (pretty = false)}>compact</button>
		<button type="button" class="btn-ghost" aria-pressed={pretty} onclick={() => (pretty = true)}>pretty</button>
		<button type="button" class="btn-ghost" onclick={() => (step = Math.max(0, step - 1))} disabled={step === 0} aria-label="前へ">◀</button>
		<span class="font-mono text-[12px] tracking-normal text-muted tnum">{step + 1}/{steps.length}</span>
		<button type="button" class="btn-ghost" onclick={() => (step = Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1} aria-label="次へ">▶</button>
	{/snippet}
	<div class="grid gap-0 sm:grid-cols-[200px_minmax(0,1fr)]">
		<ol class="border-b border-line p-3 font-mono text-[12px] leading-[1.75] tracking-normal sm:border-r sm:border-b-0">
			{#each steps as s, i (i)}
				<li>
					<button type="button" class={['w-full text-left', i === step ? 'text-accent' : i < step ? 'text-fg-2' : 'text-muted']} onclick={() => (step = i)}
						>{s.call}</button
					>
				</li>
			{/each}
		</ol>
		<div class="min-w-0 p-4 font-mono text-[12.5px] tracking-normal">
			<div class="text-muted">stack（開いているコンテナごとに「要素を書いたか」）</div>
			<div class="mt-1 flex h-7 gap-1">
				{#each cur.stack as has, i (i)}
					<span class={['flex w-12 items-center justify-center rounded-sm border text-[11px]', has ? 'border-fg' : 'border-line text-muted']}
						>{has ? 'true' : 'false'}</span
					>
				{:else}
					<span class="text-muted">[]</span>
				{/each}
			</div>
			<div class="mt-3 text-muted">after_key <span class={cur.afterKey ? 'text-accent' : 'text-fg'}>{cur.afterKey}</span></div>
			<div class="mt-3 text-muted">out</div>
			<pre class="mt-1 overflow-x-auto rounded-sm bg-sunken p-2 text-[12.5px] leading-[1.6] [tab-size:2]">{cur.out}<span
					class="inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-accent"
				></span></pre>
		</div>
	</div>
	{#snippet caption()}
		カーネルのテストと同じ呼び出しを一つずつ進めます。カンマを書くかどうかは stack の一番上の値だけで決まり、キーの直後の値は
		after_key のおかげでカンマも改行も付きません。
	{/snippet}
</Figure>
