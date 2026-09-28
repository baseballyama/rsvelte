<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: DrawerPrimitive.TitleProps = $props();
</script>

<DrawerPrimitive.Title
	bind:ref
	class={cn('text-lg leading-none font-semibold tracking-tight', className)}
	{...restProps}
/>
