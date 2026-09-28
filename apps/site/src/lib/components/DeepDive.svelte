<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<details class="deep my-6 rounded-sm border border-line">
	<summary class="flex items-baseline gap-3 px-4 py-2.5 text-[15px] font-semibold">
		<span class="chev inline-block font-mono text-[12px] font-normal text-muted">▸</span>
		<span><span class="mr-2 font-mono text-[12px] font-medium text-muted">深掘り</span>{title}</span>
	</summary>
	<div class="prose-learn border-t border-line bg-surface px-4 py-3 text-[16px]">
		{@render children()}
	</div>
</details>
