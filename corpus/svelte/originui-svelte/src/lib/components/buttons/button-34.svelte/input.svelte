<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
</script>

<div
	class="divide-primary-foreground/30 inline-flex divide-x rounded-md shadow-2xs rtl:space-x-reverse"
>
	<Button
		class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
		size="icon"
		aria-label="QR code"
	>
		<QrCodeIcon size={16} aria-hidden="true" />
	</Button>
	<Button class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10">
		Sign in
	</Button>
</div>
