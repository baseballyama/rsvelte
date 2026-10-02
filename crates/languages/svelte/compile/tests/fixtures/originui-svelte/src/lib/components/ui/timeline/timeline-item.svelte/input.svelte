<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import { useTimeline } from './timeline-context.svelte';

	import { cn } from '$lib/utils';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		step: number;
	};
	let { children, class: className, ref = $bindable(null), step, ...restProps }: Props = $props();

	const { activeStep } = useTimeline();
</script>

<div
	bind:this={ref}
	class={cn(
		'group/timeline-item relative flex flex-1 flex-col gap-0.5 group-data-[orientation=horizontal]/timeline:mt-8 not-last:group-data-[orientation=horizontal]/timeline:pe-8 group-data-[orientation=vertical]/timeline:ms-8 not-last:group-data-[orientation=vertical]/timeline:pb-12',
		'[&:has(+[data-completed="true"])_[data-slot=timeline-separator]]:bg-primary',
		className
	)}
	data-slot="timeline-item"
	data-completed={step <= activeStep || undefined}
	{...restProps}
>
	{@render children?.()}
</div>
