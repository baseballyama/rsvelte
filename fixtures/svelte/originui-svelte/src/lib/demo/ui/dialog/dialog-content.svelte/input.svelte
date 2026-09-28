<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { type DialogContentProps, Dialog as DialogPrimitive } from 'bits-ui';

	let {
		children,
		class: className,
		ref = $bindable(null),

		...restProps
	}: DialogContentProps = $props();

	let closeRef: HTMLButtonElement | null = $state(null);

	function handleOpenAutoFocus(e: Event) {
		if (restProps.onOpenAutoFocus) {
			restProps.onOpenAutoFocus(e);
		} else {
			e.preventDefault();
			closeRef?.focus();
		}
	}
</script>

<DialogPrimitive.Content
	bind:ref
	class={cn(
		'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border p-6 shadow-lg duration-200 sm:max-w-100',

		className
	)}
	{...restProps}
	onOpenAutoFocus={handleOpenAutoFocus}
>
	{@render children?.()}
	<DialogPrimitive.Close
		bind:ref={closeRef}
		class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
	>
		<svg
			width="15"
			height="15"
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="size-4"
		>
			<path
				d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
				fill="currentColor"
				fill-rule="evenodd"
				clip-rule="evenodd"
			/>
		</svg>
		<span class="sr-only">Close</span>
	</DialogPrimitive.Close>
</DialogPrimitive.Content>

<style>
	:global(div[data-dialog-content]) {
		overflow: auto;
	}

	:global(div[data-dialog-content]::-webkit-scrollbar) {
		width: 5px;
	}

	:global(div[data-dialog-content]::-webkit-scrollbar-thumb) {
		background: hsl(var(--border));
		border-radius: 5px;
	}

	:global(div[data-dialog-content]) {
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--border)) transparent;
	}
</style>
