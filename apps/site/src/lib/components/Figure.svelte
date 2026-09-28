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
</script>

<figure class={['my-8', wide && 'fig-wide']}>
	<div class="overflow-hidden rounded-sm border border-line">
		<div
			class="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-surface px-3 py-1.5"
		>
			<span class="font-mono text-[12px] tracking-normal text-muted">{label}</span>
			{#if controls}
				<div class="flex flex-wrap items-center gap-2">{@render controls()}</div>
			{/if}
		</div>
		<div class="bg-bg">{@render children()}</div>
	</div>
	{#if caption}
		<figcaption class="mt-2.5 text-[14px] leading-[1.7] text-fg-2">{@render caption()}</figcaption>
	{/if}
</figure>
