<script lang="ts">
	import type { AvailableComponentMetadata } from '$data/api/components/components.handler';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import CopyButton from './copy-button.svelte';
	import ViewComponentButton from './view-component-button.svelte';
	import { cn } from '$lib/utils.js';

	type DemoComponentProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		componentData: AvailableComponentMetadata;
		onShallowRouteClick?: (e: MouseEvent) => void;
	};

	let {
		children,
		componentData,
		onShallowRouteClick,
		ref = $bindable(null),
		...restProps
	}: DemoComponentProps = $props();
</script>

{#snippet actionButtons({ source }: { source: string })}
	<div class={cn('absolute top-2 right-2 flex items-center gap-x-2 rounded-lg')}>
		<ViewComponentButton onclick={onShallowRouteClick} />
		<div class="bg-border h-6 w-px"></div>
		<CopyButton code={source} />
	</div>
{/snippet}

<div bind:this={ref} {...restProps}>
	{@render actionButtons({ source: componentData.code.raw.content })}
	<div>
		{@render children?.()}
	</div>
</div>
