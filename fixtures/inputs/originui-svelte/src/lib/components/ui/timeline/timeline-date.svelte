<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { mergeProps, type WithElementRef } from 'bits-ui';

	type Props = WithElementRef<HTMLAttributes<HTMLTimeElement>> & {
		child?: Snippet<[{ props: HTMLAttributes<HTMLTimeElement> }]>;
	};

	let { child, children, class: className, ref = $bindable(null), ...restProps }: Props = $props();

	const mergedProps = $derived(
		mergeProps(restProps, {
			class: cn(
				'text-muted-foreground mb-1 block text-xs font-medium max-sm:group-data-[orientation=vertical]/timeline:h-4',
				className
			),
			'data-slot': 'timeline-date'
		})
	);
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<time {...mergedProps}>
		{@render children?.()}
	</time>
{/if}
