<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: DrawerPrimitive.OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay
	bind:ref
	class={cn('bg-background/80 fixed inset-0 z-50', className)}
	{...restProps}
/>
