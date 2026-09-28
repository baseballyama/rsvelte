<script lang="ts">
	import type { AvailableComponentMetadata } from '$data/api/components/components.handler';
	import type { ComponentProps } from 'svelte';

	import Button from '$lib/components/ui/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	import Share from '@lucide/svelte/icons/share-2';
	import { page } from '$app/state';

	type Props = ComponentProps<typeof Tooltip.TooltipTrigger> & {
		component: AvailableComponentMetadata;
	};

	let { component, ...restProps }: Props = $props();

	async function shareComponent() {
		const shareData = {
			text: `Check out the ${component.name} component from Origin UI - Svelte`,
			title: `Origin UI - Svelte - ${component.name}`,
			url: page.url.href
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(shareData.url);
			}
		} catch (err) {
			console.error('Error sharing:', err);
		}
	}
</script>

<Tooltip.TooltipProvider>
	<Tooltip.Tooltip>
		<Tooltip.TooltipTrigger onclick={shareComponent} {...restProps}>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<Share size={16} aria-hidden />
					<span class="sr-only">Share the ${component.name} component</span>
				</Button>
			{/snippet}
		</Tooltip.TooltipTrigger>
		<Tooltip.TooltipContent>Share the {component.name} component</Tooltip.TooltipContent>
	</Tooltip.Tooltip>
</Tooltip.TooltipProvider>
