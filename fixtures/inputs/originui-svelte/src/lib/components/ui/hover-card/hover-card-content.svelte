<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils.js';

	import { LinkPreview as HoverCardPrimitive, type WithoutChildren } from 'bits-ui';

	let {
		align = 'center',
		children,
		class: className,
		portalProps,
		ref = $bindable(null),
		showArrow = false,
		sideOffset = 4,
		...restProps
	}: WithoutChildren<HoverCardPrimitive.ContentProps> & {
		children: Snippet;
		portalProps?: HoverCardPrimitive.PortalProps;
		showArrow?: boolean;
	} = $props();
</script>

<HoverCardPrimitive.Portal {...portalProps}>
	<HoverCardPrimitive.Content
		bind:ref
		{sideOffset}
		{align}
		class={cn(
			'border-border bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-lg border p-4 shadow-lg shadow-black/5 outline-hidden',
			className
		)}
		{...restProps}
	>
		{@render children()}
		{#if showArrow}
			<HoverCardPrimitive.Arrow
				class="text-popover -my-px drop-shadow-[0_1px_0_hsl(var(--border))]"
			/>
		{/if}
	</HoverCardPrimitive.Content>
</HoverCardPrimitive.Portal>
