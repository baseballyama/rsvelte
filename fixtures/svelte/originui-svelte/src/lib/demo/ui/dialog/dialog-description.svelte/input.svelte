<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { type DialogDescriptionProps, Dialog as DialogPrimitive } from 'bits-ui';

	let { class: className, ref = $bindable(null), ...restProps }: DialogDescriptionProps = $props();
</script>

<DialogPrimitive.Description
	bind:ref
	class={cn('text-muted-foreground text-sm', className)}
	{...restProps}
/>
