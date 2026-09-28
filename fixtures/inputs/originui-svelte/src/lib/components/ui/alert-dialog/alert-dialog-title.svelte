<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: AlertDialogPrimitive.TitleProps = $props();
</script>

<AlertDialogPrimitive.Title
	bind:ref
	class={cn('text-lg font-semibold', className)}
	{...restProps}
/>
