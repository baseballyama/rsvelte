<script lang="ts">
	import DrawerOverlay from './drawer-overlay.svelte';
	import { cn } from '$lib/utils.js';

	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: DrawerPrimitive.ContentProps = $props();
</script>

<DrawerPrimitive.Portal>
	<DrawerOverlay />
	<DrawerPrimitive.Content
		bind:ref
		class={cn(
			'border-border bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-(--radius) border',
			className
		)}
		{...restProps}
	>
		<div class="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full"></div>
		{@render children?.()}
	</DrawerPrimitive.Content>
</DrawerPrimitive.Portal>
