<script lang="ts">
	import { page } from '$app/state';
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { chapterByHref, sectionTitle } from '$lib/site';

	let { id }: { id: string } = $props();

	const linkLabel = bilingual((title: string) => `「${title}」へのリンク`, (title: string) => `Link to "${title}"`);

	const chapter = $derived(chapterByHref(page.url.pathname));
	const index = $derived(chapter ? chapter.sections.findIndex((s) => s.id === id) + 1 : 0);
	const title = $derived.by(() => {
		if (!chapter) throw new Error(`H2 ${id} outside a chapter`);
		return sectionTitle(chapter, id);
	});
</script>

<h2 {id} class="group relative">
	<span class="mb-1 block font-mono text-[12px] font-normal tracking-normal text-muted tnum" aria-hidden="true"
		>§{Number(chapter?.number ?? 0)}.{index}</span
	>{title}<a
		href="#{id}"
		class="ml-2 inline-block align-baseline font-mono text-[0.75em] font-normal text-muted opacity-0 group-hover:opacity-100 hover:text-accent focus-visible:opacity-100 max-md:opacity-40"
		aria-label={linkLabel[readerLang()](title)}>#</a
	>
</h2>
