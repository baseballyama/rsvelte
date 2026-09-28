<script lang="ts">
	import TimeSegment from './time-segment.svelte';

	import { cn } from '$lib/utils';
	import { TimeField, type WithoutChildren } from 'bits-ui';

	let {
		class: className,
		unstyled = false,
		...restProps
	}: WithoutChildren<TimeField.InputProps> & {
		class?: string;
		unstyled?: boolean;
	} = $props();
</script>

<TimeField.Input
	{...restProps}
	class={cn(
		!unstyled &&
			'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:has-aria-invalid:ring-destructive/20 dark:focus-within:has-aria-invalid:ring-destructive/40 focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-[3px]',
		className
	)}
>
	{#snippet children({ segments })}
		{#each segments as segment, i (segment.part + i)}
			<!-- Dont render the day period segment e.g. AM/PM -->
			{#if segment.part !== 'dayPeriod'}
				<TimeSegment {segment} />
			{/if}
		{/each}
	{/snippet}
</TimeField.Input>
