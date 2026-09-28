<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import Button from '$lib/components/ui/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	import Link from '@lucide/svelte/icons/square-arrow-out-up-right';

	type Props = ComponentProps<typeof Tooltip.TooltipTrigger> & {
		description: string;
		href: string;
	};

	let { description, href, ...restProps }: Props = $props();
</script>

<Tooltip.TooltipProvider>
	<Tooltip.Tooltip>
		<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
		<Tooltip.TooltipTrigger {...restProps as any}>
			<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
			{#snippet children({ props }: { props: any })}
				<Button {href} variant="ghost" size="icon" {...props}>
					<Link size={16} aria-hidden />
					<span class="sr-only">{description}</span>
				</Button>
			{/snippet}
		</Tooltip.TooltipTrigger>
		<Tooltip.TooltipContent>{description}</Tooltip.TooltipContent>
	</Tooltip.Tooltip>
</Tooltip.TooltipProvider>
