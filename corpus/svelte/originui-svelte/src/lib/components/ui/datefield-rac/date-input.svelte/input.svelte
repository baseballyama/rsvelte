<script lang="ts">
	import DateSegment from './date-segment.svelte';

	import { cn } from '$lib/utils';
	import { DateField } from 'bits-ui';

	let {
		class: className,
		unstyled = false,
		...props
	} = $props<{
		class?: string;
		unstyled?: boolean;
	}>();
</script>

<DateField.Input
	{...props}
	class={cn(
		!unstyled &&
			'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:has-aria-invalid:ring-destructive/20 dark:focus-within:has-aria-invalid:ring-destructive/40 focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-[3px]',
		className
	)}
>
	{#snippet children({ segments })}
		{#each segments as segment, i (segment.part + i)}
			<DateSegment {segment} />
		{/each}
	{/snippet}
</DateField.Input>
