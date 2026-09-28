<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { cn } from '$lib/utils.js';

	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: DrawerPrimitive.CloseProps = $props();
</script>

<DrawerPrimitive.Close bind:ref class={cn(className)} {...restProps}>
	{#snippet child({ props })}
		<Button variant="outline" {...props}>
			{@render children?.()}
		</Button>
	{/snippet}
</DrawerPrimitive.Close>
