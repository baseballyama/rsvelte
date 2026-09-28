<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	type Props = HTMLAttributes<HTMLDivElement> & {
		code: string;
	};
	let { class: className, code, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'[&_pre]:text-foreground [&_code]:py-4 [&_pre]:overflow-x-auto [&_pre]:overflow-y-auto [&_pre]:rounded-md [&_pre]:px-6 [&_pre]:py-4 [&_pre]:text-left [&_pre]:text-sm',
		className
	)}
	{...restProps}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html code}
</div>

<style>
	:global(html.dark .shiki),
	:global(html.dark .shiki span) {
		color: var(--shiki-dark) !important;
		background-color: transparent !important;
	}
</style>
