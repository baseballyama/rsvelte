<script lang="ts">
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { chaptersIn, type Chapter } from '$lib/site';
	import Icon from './Icon.svelte';

	let { chapter }: { chapter: Chapter } = $props();

	const text = bilingual(
		{ label: '前後の章', previous: '前の章', next: '次の章' },
		{ label: 'Previous and next chapters', previous: 'Previous chapter', next: 'Next chapter' }
	);
	const t = $derived(text[readerLang()]);
	const chapters = $derived(chaptersIn(readerLang()));
	const i = $derived(chapters.findIndex((c) => c.slug === chapter.slug));
	const prev = $derived(i > 0 ? chapters[i - 1] : undefined);
	const next = $derived(i < chapters.length - 1 ? chapters[i + 1] : undefined);
</script>

<nav class="mt-20 grid gap-3 border-t border-line pt-8 sm:grid-cols-2" aria-label={t.label}>
	{#if prev}
		<a
			href={prev.href}
			rel="prev"
			class="group flex flex-col rounded-lg border border-line px-4 py-3.5 hover:border-line-strong hover:bg-surface"
		>
			<span class="flex items-center gap-1.5 text-[12.5px] text-muted">
				<Icon name="arrow-left" size={13} class="transition-transform group-hover:-translate-x-0.5" />{t.previous}
				<span class="font-mono tracking-normal">{prev.number}</span>
			</span>
			<span class="mt-1 text-[15.5px] leading-snug font-medium text-fg group-hover:text-accent">{prev.title}</span>
		</a>
	{:else}
		<span class="max-sm:hidden"></span>
	{/if}
	{#if next}
		<a
			href={next.href}
			rel="next"
			class="group flex flex-col rounded-lg border border-line px-4 py-3.5 text-right hover:border-line-strong hover:bg-surface"
		>
			<span class="flex items-center justify-end gap-1.5 text-[12.5px] text-muted">
				{t.next} <span class="font-mono tracking-normal">{next.number}</span><Icon
					name="arrow-right"
					size={13}
					class="transition-transform group-hover:translate-x-0.5"
				/>
			</span>
			<span class="mt-1 text-[15.5px] leading-snug font-medium text-fg group-hover:text-accent">{next.title}</span>
			<span class="mt-1 line-clamp-2 text-[13px] leading-[1.6] text-muted">{next.abstract}</span>
		</a>
	{/if}
</nav>
