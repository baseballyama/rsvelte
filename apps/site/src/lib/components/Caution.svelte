<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="my-6 rounded-sm border border-line-strong px-4 py-3 text-[16px] leading-[1.8]">
	<span class="mr-2 font-mono text-[13px] font-medium text-fg">注意</span>{@render children()}
</div>
