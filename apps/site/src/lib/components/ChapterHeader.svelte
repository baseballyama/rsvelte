<script lang="ts">
	import type { Chapter } from '$lib/site';
	import Icon from './Icon.svelte';

	let { chapter, lead }: { chapter: Chapter; lead: string } = $props();
</script>

<header class="mb-12 border-b border-line pb-8">
	<nav aria-label="パンくず" class="flex items-center gap-1.5 text-[13px] text-muted">
		<a href="/learn" class="hover:text-fg">Learn</a>
		<Icon name="chevron" size={12} />
		<span class="font-mono tracking-normal tnum">第 {chapter.number} 章</span>
	</nav>
	<h1
		class="mt-3 text-[30px] leading-[1.35] font-semibold tracking-[0.005em] sm:text-[38px] sm:leading-[1.3]"
		style="font-stretch: 92%"
	>
		{chapter.title}
	</h1>
	<p class="mt-5 text-[17.5px] leading-[1.9] text-fg-2 sm:text-[18.5px]">{lead}</p>
	<dl class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] tracking-normal text-muted">
		<div class="flex items-center gap-1.5"><dt class="sr-only">読了時間</dt><dd>約 {chapter.minutes} 分</dd></div>
		{#if chapter.sections.length > 0}
			<div class="flex items-center gap-1.5"><dt class="sr-only">節の数</dt><dd>{chapter.sections.length} 節</dd></div>
		{/if}
		{#if chapter.module}
			<div class="flex min-w-0 items-center gap-1.5">
				<dt class="sr-only">対象のソース</dt>
				<dd class="flex min-w-0 items-center gap-1.5">
					<Icon name="file" size={13} />
					<span class="truncate">crates/rsvelte_kernel/src/{chapter.module.split('/')[1]}.rs</span>
				</dd>
			</div>
		{/if}
	</dl>
</header>
