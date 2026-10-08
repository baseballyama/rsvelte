<script lang="ts">
	import { page } from '$app/state';
	import { bilingual, localizedPath } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { appendixIn, chaptersIn, type Chapter } from '$lib/site';

	let {
		active,
		outlineAtXl = true
	}: {
		active: string | null;
		/** False where a separate page outline takes over at xl, so the sections are not listed twice. */
		outlineAtXl?: boolean;
	} = $props();

	const text = bilingual(
		{
			chapters: '章',
			start: 'はじめに',
			modules: 'カーネルのモジュール',
			polish: '測って磨く',
			overview: '全体の構成（図）',
			label: 'Learn の章',
			appendix: '付録'
		},
		{
			chapters: 'Chapters',
			start: 'Start here',
			modules: 'Kernel modules',
			polish: 'Measure and improve',
			overview: 'Overview (figure)',
			label: 'Learn chapters',
			appendix: 'Appendix'
		}
	);
	const lang = $derived(readerLang());
	const t = $derived(text[lang]);
	const chapters = $derived(chaptersIn(lang));
	const appendix = $derived(appendixIn(lang));
	// Rendered hrefs are in the reader's language, so compare with the localized path.
	const path = $derived(page.url.pathname.replace(/\/$/, '') || '/');

	// Grouped by role rather than by a hand-kept list: the module chapters are the ones naming a module.
	const groups = $derived.by(() => {
		const first = chapters.findIndex((c) => c.module);
		const last = chapters.findLastIndex((c) => c.module);
		if (first < 0) return [{ title: t.chapters, items: chapters }];
		return [
			{ title: t.start, items: chapters.slice(0, first) },
			{ title: t.modules, items: chapters.slice(first, last + 1) },
			{ title: t.polish, items: chapters.slice(last + 1) }
		].filter((g) => g.items.length > 0);
	});
</script>

{#snippet item(c: Chapter)}
	{@const here = path === c.href}
	<li>
		<a
			href={c.href}
			class={[
				'group flex gap-2.5 rounded-md px-2 py-[5px]',
				here ? 'bg-accent-wash text-fg' : 'text-fg-2 hover:bg-surface hover:text-fg'
			]}
			aria-current={here ? 'page' : undefined}
		>
			<span
				class={[
					'w-5 shrink-0 pt-px font-mono text-[11.5px] leading-[1.75] tracking-normal tnum',
					here ? 'text-accent' : 'text-muted'
				]}>{c.number}</span
			>
			<span class={here ? 'font-medium' : ''}>{c.title}</span>
		</a>
		{#if c.slug === 'kernel' && !here}
			<a href={localizedPath('/learn/kernel#overview', lang)} class="ml-[30px] block rounded-md px-2 py-[3px] text-[13px] text-muted hover:bg-surface hover:text-fg">{t.overview}</a>
		{/if}
		{#if here && c.sections.length > 0}
			<ol class={['mt-1 mb-2 ml-[18px] border-l border-line', !outlineAtXl && 'xl:hidden']}>
				{#each c.sections as s (s.id)}
					<li>
						<a
							href="#{s.id}"
							class={[
								'-ml-px block border-l py-[3px] pr-2 pl-[18px] text-[13px] leading-[1.55]',
								active === s.id ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg-2'
							]}>{s.title}</a
						>
					</li>
				{/each}
			</ol>
		{/if}
	</li>
{/snippet}

<nav aria-label={t.label} class="text-[14px] leading-[1.55]">
	{#each groups as g (g.title)}
		<p class="eyebrow mt-6 mb-1.5 px-2 first:mt-0">{g.title}</p>
		<ol class="space-y-px">
			{#each g.items as c (c.slug)}{@render item(c)}{/each}
		</ol>
	{/each}
	<p class="eyebrow mt-6 mb-1.5 px-2">{t.appendix}</p>
	<ul class="space-y-px">
		{#each appendix as a (a.href)}
			{@const here = path === a.href}
			<li>
				<a
					href={a.href}
					class={[
						'block rounded-md py-[5px] pr-2 pl-[38px]',
						here ? 'bg-accent-wash font-medium text-fg' : 'text-fg-2 hover:bg-surface hover:text-fg'
					]}
					aria-current={here ? 'page' : undefined}>{a.title}</a
				>
			</li>
		{/each}
	</ul>
</nav>
