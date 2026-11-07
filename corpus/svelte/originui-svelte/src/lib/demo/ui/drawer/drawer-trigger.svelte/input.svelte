<script lang="ts">
	import type { DialogTriggerProps } from 'bits-ui';

	import Button from '$lib/components/ui/button.svelte';
	import { cn } from '$lib/utils.js';

	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: DialogTriggerProps = $props();
</script>

<DrawerPrimitive.Trigger bind:ref class={cn(className)} {...restProps}>
	{#snippet child({ props })}
		<Button variant="outline" {...props}>
			{@render children?.()}
		</Button>
	{/snippet}
</DrawerPrimitive.Trigger>
