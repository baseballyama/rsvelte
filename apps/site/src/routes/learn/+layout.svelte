<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import LearnNav from '$lib/components/LearnNav.svelte';
	import { appendix, chapterByHref } from '$lib/site';

	let { children } = $props();

	const chapter = $derived(chapterByHref(page.url.pathname));
	const wide = $derived(appendix.some((a) => page.url.pathname.startsWith(a.href)));
	let active: string | null = $state(null);
	let drawer: HTMLDetailsElement | undefined = $state();

	// The section whose heading was last scrolled past is the current one.
	function observe() {
		const heads = [...document.querySelectorAll<HTMLElement>('article h2[id]')];
		if (heads.length === 0) {
			active = null;
			return;
		}
		const update = () => {
			let cur = heads[0].id;
			for (const h of heads) if (h.getBoundingClientRect().top < 200) cur = h.id;
			active = cur;
		};
		update();
		addEventListener('scroll', update, { passive: true });
		return () => removeEventListener('scroll', update);
	}

	let stop: (() => void) | undefined;
	afterNavigate(() => {
		stop?.();
		stop = observe();
		if (drawer) drawer.open = false;
	});
	$effect(() => () => stop?.());

	const currentTitle = $derived(chapter?.sections.find((s) => s.id === active)?.title);
</script>

<div
	class="mx-auto max-w-[1400px] px-4 md:px-8 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[248px_minmax(0,40em)_232px] xl:px-12"
>
	<aside class="hidden lg:block">
		<div class="sticky top-14 max-h-[calc(100dvh-56px)] overflow-y-auto py-10 pr-2">
			<LearnNav {active} />
		</div>
	</aside>

	<details
		bind:this={drawer}
		class="sticky top-14 z-30 -mx-4 border-b border-line bg-bg px-4 md:-mx-8 md:px-8 lg:hidden"
	>
		<summary class="flex cursor-pointer items-baseline gap-3 py-2.5 text-[14px]">
			<span class="font-mono text-[12px] tracking-normal text-muted">{chapter?.number ?? '付録'}</span>
			<span class="truncate">{currentTitle ?? chapter?.title ?? '目次'}</span>
			<span class="ml-auto font-mono text-[12px] text-muted">目次</span>
		</summary>
		<div class="max-h-[70dvh] overflow-y-auto pb-4"><LearnNav {active} /></div>
	</details>

	<article class={['min-w-0 py-10 lg:py-14', wide && 'learn-wide xl:col-span-2']}>
		{@render children()}
	</article>
</div>
