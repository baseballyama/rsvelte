<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<details class="deep group/deep my-7 rounded-lg border border-line bg-bg open:bg-sunken">
	<summary class="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-surface/60">
		<span
			class="chev mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-sm border border-line bg-raised text-muted"
			><Icon name="chevron" size={12} /></span
		>
		<span class="min-w-0">
			<span class="block font-mono text-[11.5px] tracking-[0.04em] text-info">深掘り</span>
			<span class="mt-0.5 block text-[15.5px] leading-[1.6] font-semibold">{title}</span>
		</span>
		<span class="ml-auto hidden shrink-0 pt-[18px] text-[12px] text-muted sm:block"
			><span class="group-open/deep:hidden">開く</span><span class="hidden group-open/deep:inline">閉じる</span></span
		>
	</summary>
	<div class="prose-learn border-t border-line px-4 pt-3 pb-4 text-[16px]">
		{@render children()}
	</div>
</details>
