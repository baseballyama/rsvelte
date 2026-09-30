<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		controls,
		caption,
		children,
		wide = false
	}: {
		label: string;
		controls?: Snippet;
		caption?: Snippet;
		children: Snippet;
		/** Spans the body column and the margin column on wide screens. */
		wide?: boolean;
	} = $props();

	// "図 2.1 · タイトル": the number is set apart so a reader scanning for 図 2.1 finds it.
	const parts = $derived.by(() => {
		const m = /^(図\s*[\d.]+)\s*·\s*(.*)$/.exec(label);
		return m ? { number: m[1], title: m[2] } : { number: '', title: label };
	});
</script>

<figure class={['my-9', wide && 'fig-wide']}>
	<div class="overflow-hidden rounded-lg border border-line bg-bg">
		<div
			class="flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-surface/70 px-3 py-1.5"
		>
			<span class="flex items-baseline gap-2 font-mono text-[12px] tracking-normal">
				{#if parts.number}<span class="font-medium text-fg tnum">{parts.number}</span>{/if}
				<span class="text-muted">{parts.title}</span>
			</span>
			{#if controls}
				<div class="flex flex-wrap items-center gap-2">{@render controls()}</div>
			{/if}
		</div>
		<div class="bg-bg">{@render children()}</div>
	</div>
	{#if caption}
		<figcaption class="mt-3 border-l-2 border-line pl-3 text-[14px] leading-[1.75] text-fg-2">
			{@render caption()}
		</figcaption>
	{/if}
</figure>
