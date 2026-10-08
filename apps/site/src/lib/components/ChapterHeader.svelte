<script lang="ts">
	import { bilingual, localizedPath } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { moduleFile, type Chapter } from '$lib/site';
	import ChapterPosition from './ChapterPosition.svelte';
	import Icon from './Icon.svelte';

	let { chapter, lead }: { chapter: Chapter; lead: string } = $props();

	const text = bilingual(
		{
			breadcrumb: 'パンくず',
			number: (n: string) => `第 ${n} 章`,
			readingTime: '読了時間',
			minutes: (n: number) => `約 ${n} 分`,
			sectionCount: '節の数',
			sections: (n: number) => `${n} 節`,
			source: '対象のソース'
		},
		{
			breadcrumb: 'Breadcrumb',
			number: (n: string) => `Chapter ${n}`,
			readingTime: 'Reading time',
			minutes: (n: number) => `About ${n} ${n === 1 ? 'minute' : 'minutes'}`,
			sectionCount: 'Number of sections',
			sections: (n: number) => `${n} ${n === 1 ? 'section' : 'sections'}`,
			source: 'Source file'
		}
	);
	const lang = $derived(readerLang());
	const t = $derived(text[lang]);
</script>

<header class="mb-12 border-b border-line pb-8">
	<nav aria-label={t.breadcrumb} class="flex items-center gap-1.5 text-[13px] text-muted">
		<a href={localizedPath('/learn', lang)} class="hover:text-fg">Learn</a>
		<Icon name="chevron" size={12} />
		<span class="font-mono tracking-normal tnum">{t.number(chapter.number)}</span>
	</nav>
	<h1
		class="mt-3 text-[30px] leading-[1.35] font-semibold tracking-[0.005em] sm:text-[38px] sm:leading-[1.3]"
		style="font-stretch: 92%"
	>
		{chapter.title}
	</h1>
	<p class="mt-5 text-[17.5px] leading-[1.9] text-fg-2 sm:text-[18.5px]">{lead}</p>
	<dl class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] tracking-normal text-muted">
		<div class="flex items-center gap-1.5"><dt class="sr-only">{t.readingTime}</dt><dd>{t.minutes(chapter.minutes)}</dd></div>
		{#if chapter.sections.length > 0}
			<div class="flex items-center gap-1.5"><dt class="sr-only">{t.sectionCount}</dt><dd>{t.sections(chapter.sections.length)}</dd></div>
		{/if}
		{#if chapter.module}
			<div class="flex min-w-0 items-center gap-1.5">
				<dt class="sr-only">{t.source}</dt>
				<dd class="flex min-w-0 items-center gap-1.5">
					<Icon name="file" size={13} />
					<span class="truncate">{moduleFile(chapter.module)}</span>
				</dd>
			</div>
		{/if}
	</dl>
	<ChapterPosition href={chapter.href} />
</header>
