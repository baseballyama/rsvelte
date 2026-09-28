<script lang="ts">
	import type { Chapter } from '$lib/site';

	let { chapter, lead }: { chapter: Chapter; lead: string } = $props();
</script>

<header class="relative mb-10">
	<span
		class="font-mono text-[13px] tracking-normal whitespace-nowrap text-muted xl:absolute xl:top-[0.55em] xl:right-full xl:mr-5"
		aria-hidden="true">{chapter.number}</span
	>
	<h1 class="mt-1 text-[30px] leading-[1.3] font-semibold sm:text-[36px]" style="font-stretch: 92%">
		{chapter.title}
	</h1>
	<p class="mt-4 text-[18px] leading-[1.8] text-fg-2">{lead}</p>
	<p class="mt-4 font-mono text-[12px] tracking-normal text-muted">
		約 {chapter.minutes} 分{#if chapter.module}<span> · crates/rsv_kernel/src/{chapter.module.split('/')[1]}.rs</span>{/if}
	</p>
</header>
