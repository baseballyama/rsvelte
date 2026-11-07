<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button.svelte';
	import { cn } from '$lib/utils.js';

	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: AlertDialogPrimitive.CancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel
	bind:ref
	class={cn(buttonVariants({ variant: 'outline' }), className)}
	{...restProps}
/>
