<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import { timelineContext } from './timeline-context.svelte';

	import { cn } from '$lib/utils';

	type TimelineProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		defaultValue?: number;
		onValueChange?: (value: number) => void;
		orientation?: 'horizontal' | 'vertical';
		value?: number;
	};
	let {
		children,
		class: className,
		defaultValue = 1,
		onValueChange,
		orientation = 'vertical',
		ref = $bindable(null),
		value,
		...restProps
	}: TimelineProps = $props();

	let activeStep = $state(defaultValue);

	function setActiveStep(step: number) {
		if (value === undefined) {
			activeStep = step;
		}

		onValueChange?.(step);
	}

	const currentStep = $derived(value ?? activeStep);

	timelineContext.set({
		activeStep: currentStep,
		setActiveStep
	});
</script>

<div
	bind:this={ref}
	data-slot="timeline"
	class={cn(
		'group/timeline flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
		className
	)}
	data-orientation={orientation}
	{...restProps}
>
	{@render children?.()}
</div>
