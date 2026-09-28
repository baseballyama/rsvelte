<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils.js';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let {
		children,
		class: className,
		ref = $bindable(null),
		value = $bindable(),
		...restProps
	}: WithElementRef<HTMLSelectAttributes> = $props();
</script>

<div class="relative">
	<select
		bind:this={ref}
		bind:value
		class={cn(
			'peer border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/20 has-[option[disabled]:checked]:text-muted-foreground inline-flex w-full cursor-pointer appearance-none items-center rounded-lg border text-sm shadow-xs shadow-black/5 transition-shadow focus-visible:ring-[3px] focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
			restProps.multiple ? '[&_option:checked]:bg-accent py-1 *:px-3 *:py-1' : 'h-9 ps-3 pe-8',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</select>
	{#if !restProps.multiple}
		<span
			class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center peer-disabled:opacity-50"
		>
			<ChevronDown size={16} aria-hidden="true" />
		</span>
	{/if}
</div>
