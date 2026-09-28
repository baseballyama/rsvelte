<script lang="ts">
	import { chapters, type Chapter } from '$lib/site';

	let { chapter }: { chapter: Chapter } = $props();

	const i = $derived(chapters.findIndex((c) => c.slug === chapter.slug));
	const prev = $derived(i > 0 ? chapters[i - 1] : undefined);
	const next = $derived(i < chapters.length - 1 ? chapters[i + 1] : undefined);
</script>

<nav class="mt-20 grid grid-cols-2 gap-4 border-t border-line pt-6" aria-label="前後の章">
	<div>
		{#if prev}
			<a href={prev.href} class="group block">
				<span class="font-mono text-[12px] tracking-normal text-muted">← {prev.number}</span>
				<span class="mt-1 block text-[15px] leading-snug group-hover:text-accent">{prev.title}</span>
			</a>
		{/if}
	</div>
	<div class="text-right">
		{#if next}
			<a href={next.href} class="group block">
				<span class="font-mono text-[12px] tracking-normal text-muted">{next.number} →</span>
				<span class="mt-1 block text-[15px] leading-snug group-hover:text-accent">{next.title}</span>
			</a>
		{/if}
	</div>
</nav>
