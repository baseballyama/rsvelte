<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import LearnNav from '$lib/components/LearnNav.svelte';
	import OnThisPage from '$lib/components/OnThisPage.svelte';
	import { appendix, chapterByHref, chapters } from '$lib/site';

	let { children } = $props();

	const chapter = $derived(chapterByHref(page.url.pathname));
	const wide = $derived(appendix.some((a) => page.url.pathname.startsWith(a.href)));
	const outline = $derived(!wide && !!chapter && chapter.sections.length > 0);
	let active: string | null = $state(null);
	let progress = $state(0);
	let drawer: HTMLDetailsElement | undefined = $state();
	let article: HTMLElement | undefined = $state();

	// The section whose heading was last scrolled past is the current one.
	function observe() {
		const heads = [...document.querySelectorAll<HTMLElement>('article h2[id]')];
		const update = () => {
			if (article) {
				const r = article.getBoundingClientRect();
				const span = r.height - innerHeight;
				progress = span <= 0 ? 1 : Math.min(Math.max(-r.top / span, 0), 1);
			}
			if (heads.length === 0) {
				active = null;
				return;
			}
			let cur = heads[0].id;
			for (const h of heads) if (h.getBoundingClientRect().top < 200) cur = h.id;
			// At the very bottom a short last section can never reach the line; it is still the one being read.
			if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = heads[heads.length - 1].id;
			active = cur;
		};
		update();
		addEventListener('scroll', update, { passive: true });
		addEventListener('resize', update, { passive: true });
		return () => {
			removeEventListener('scroll', update);
			removeEventListener('resize', update);
		};
	}

	let stop: (() => void) | undefined;
	afterNavigate(() => {
		stop?.();
		stop = observe();
		if (drawer) drawer.open = false;
	});
	$effect(() => () => stop?.());

	const currentTitle = $derived(chapter?.sections.find((s) => s.id === active)?.title);
	const ordinal = $derived(chapter ? chapters.indexOf(chapter) : -1);
</script>

{#if chapter}
	<div class="pointer-events-none fixed inset-x-0 top-14 z-40 h-[2px]" aria-hidden="true">
		<div class="h-full origin-left bg-accent" style:transform="scaleX({progress})"></div>
	</div>
{/if}

<div
	class={[
		'mx-auto max-w-[1440px] px-4 md:px-8 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-12',
		outline && 'xl:grid-cols-[232px_minmax(0,820px)_200px] xl:justify-between'
	]}
>
	<aside class="hidden lg:block">
		<div class="thin-scrollbar sticky top-14 -ml-2 max-h-[calc(100dvh-56px)] overflow-y-auto py-10 pr-2 pl-0">
			{#if ordinal >= 0}
				<div class="mb-6 px-2">
					<div class="flex items-baseline justify-between font-mono text-[11.5px] tracking-normal text-muted tnum">
						<span>進み具合</span><span>{ordinal + 1} / {chapters.length}</span>
					</div>
					<div class="mt-1.5 h-[3px] overflow-hidden rounded-full bg-surface">
						<div
							class="h-full rounded-full bg-accent/70"
							style:width="{((ordinal + progress) / chapters.length) * 100}%"
						></div>
					</div>
				</div>
			{/if}
			<LearnNav {active} outlineAtXl={!outline} />
		</div>
	</aside>

	<details
		bind:this={drawer}
		class="group/drawer sticky top-14 z-30 -mx-4 border-b border-line bg-[var(--header-bg)] px-4 backdrop-blur-md md:-mx-8 md:px-8 lg:hidden"
	>
		<summary class="flex cursor-pointer list-none items-center gap-3 py-2.5 text-[14px] [&::-webkit-details-marker]:hidden">
			<span class="rounded-sm border border-line px-1.5 font-mono text-[11.5px] tracking-normal text-muted tnum"
				>{chapter?.number ?? '付録'}</span
			>
			<span class="min-w-0 truncate">
				<span class={currentTitle ? 'text-muted max-sm:hidden' : ''}>{chapter?.title ?? '目次'}</span>
				{#if currentTitle}<span class="mx-1.5 text-line-strong max-sm:hidden">/</span><span>{currentTitle}</span>{/if}
			</span>
			<span
				class="ml-auto flex shrink-0 items-center gap-1 rounded-md border border-line bg-raised px-2 py-0.5 text-[12px] text-fg-2"
			>
				目次<span class="inline-block transition-transform group-open/drawer:rotate-180" aria-hidden="true">▾</span>
			</span>
		</summary>
		<div class="thin-scrollbar max-h-[70dvh] overflow-y-auto pt-1 pb-5"><LearnNav {active} /></div>
	</details>

	<article
		bind:this={article}
		class={['learn-article min-w-0 py-10 lg:py-14', wide && 'learn-wide']}
		data-outline={outline || undefined}
	>
		{@render children()}
	</article>

	{#if outline && chapter}
		<aside class="hidden xl:block">
			<div class="thin-scrollbar sticky top-14 max-h-[calc(100dvh-56px)] overflow-y-auto py-14">
				<OnThisPage {chapter} {active} {progress} />
			</div>
		</aside>
	{/if}
</div>

<style>
	/* Prose, code and ordinary figures keep the reading measure; a wide figure takes the whole column. */
	.learn-article:not(.learn-wide) > :global(:not(.fig-wide)) {
		max-width: 680px;
	}
</style>
