<script lang="ts">
	import AlertDialogOverlay from './alert-dialog-overlay.svelte';
	import { cn } from '$lib/utils.js';

	import { AlertDialog as AlertDialogPrimitive, type WithoutChild } from 'bits-ui';

	let {
		class: className,
		portalProps,
		ref = $bindable(null),
		...restProps
	}: WithoutChild<AlertDialogPrimitive.ContentProps> & {
		portalProps?: AlertDialogPrimitive.PortalProps;
	} = $props();
</script>

<AlertDialogPrimitive.Portal {...portalProps}>
	<AlertDialogOverlay />
	<AlertDialogPrimitive.Content
		bind:ref
		class={cn(
			'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border p-6 shadow-lg duration-200 sm:max-w-100',
			className
		)}
		{...restProps}
	/>
</AlertDialogPrimitive.Portal>
