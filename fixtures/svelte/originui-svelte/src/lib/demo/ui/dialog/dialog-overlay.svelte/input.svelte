<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { type DialogOverlayProps, Dialog as DialogPrimitive } from 'bits-ui';

	let { class: className, ref = $bindable(null), ...restProps }: DialogOverlayProps = $props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	class={cn(
		'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',

		className
	)}
	{...restProps}
/>
