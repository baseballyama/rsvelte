<script lang="ts">
	import { page } from '$app/state';
	import { chapterByHref, sectionTitle } from '$lib/site';

	let { id }: { id: string } = $props();

	const chapter = $derived(chapterByHref(page.url.pathname));
	const index = $derived(chapter ? chapter.sections.findIndex((s) => s.id === id) + 1 : 0);
	const title = $derived.by(() => {
		if (!chapter) throw new Error(`H2 ${id} outside a chapter`);
		return sectionTitle(chapter, id);
	});
</script>

<h2 {id} class="group relative">
	<a
		href="#{id}"
		class="absolute top-[0.35em] right-full mr-4 hidden font-mono text-[12px] font-normal tracking-normal whitespace-nowrap text-muted hover:text-accent xl:block"
		aria-label="この節へのリンク">§{Number(chapter?.number ?? 0)}.{index}</a
	>{title}
</h2>
