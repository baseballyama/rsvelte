<script lang="ts">
	import type { EventHandler } from 'svelte/elements';

	import Button from '$lib/components/ui/button.svelte';

	import IconCircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import IconX from '@lucide/svelte/icons/x';

	let fileInput: HTMLInputElement;
	let fileName = $state<null | string>(null);
	let previewUrl = $state<null | string>(null);

	function handleThumbnailClick() {
		fileInput.click();
	}

	const handleFileChange: EventHandler<Event, HTMLInputElement> = (e) => {
		const file = e.currentTarget.files?.[0];
		if (file) {
			fileName = file.name;
			previewUrl = URL.createObjectURL(file);
		}
	};

	const handleRemove: EventHandler<Event, HTMLAnchorElement | HTMLButtonElement> = () => {
		fileName = null;
		previewUrl = null;
		fileInput.value = '';
	};
</script>

<div>
	<div class="relative inline-flex">
		<Button
			variant="outline"
			class="relative size-16 overflow-hidden"
			onclick={handleThumbnailClick}
			aria-label={previewUrl ? 'Change image' : 'Upload image'}
		>
			{#if previewUrl}
				<img
					class="absolute inset-0 h-full w-full object-cover"
					src={previewUrl}
					alt="Preview of uploaded file"
				/>
			{:else}
				<div aria-hidden="true">
					<IconCircleUserRound class="opacity-60" width="16" height="16" stroke-width="2" />
				</div>
			{/if}
		</Button>
		{#if previewUrl}
			<Button
				onclick={handleRemove}
				size="icon"
				variant="destructive"
				class="border-background absolute -top-2 -right-2 size-6 rounded-full border-2"
				aria-label="Remove image"
			>
				<IconX size={16} />
			</Button>
		{/if}
		<input
			type="file"
			bind:this={fileInput}
			onchange={handleFileChange}
			class="hidden"
			accept="image/*"
			aria-label="Upload image file"
		/>
	</div>
	{#if fileName}
		<p
			class="text-muted-foreground mt-2 text-xs lg:opacity-0 lg:group-focus-within/item:opacity-100 lg:group-hover/item:opacity-100"
		>
			{fileName}
		</p>
	{/if}
	<div class="sr-only" aria-live="polite" role="status">
		{previewUrl ? 'Image uploaded and preview available' : 'No image uploaded'}
	</div>
</div>
