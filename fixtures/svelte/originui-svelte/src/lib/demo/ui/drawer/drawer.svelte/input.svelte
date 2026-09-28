<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		activeSnapPoint = $bindable(null),
		open = $bindable(false),
		setBackgroundColorOnScale = false,
		shouldScaleBackground = true,
		...restProps
	}: DrawerPrimitive.RootProps = $props();
</script>

<DrawerPrimitive.Root
	{shouldScaleBackground}
	{setBackgroundColorOnScale}
	bind:open
	bind:activeSnapPoint
	{...restProps}
/>
