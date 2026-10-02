<script lang="ts">
	import type { EventHandler } from 'svelte/elements';

	import Button from '$lib/components/ui/button.svelte';

	import IconCircleUserRound from '@lucide/svelte/icons/circle-user-round';

	let fileInput: HTMLInputElement;
	let files = $state<FileList | null>(null);
	let fileName = $state<null | string>(null);
	let previewUrl = $state<null | string>(null);

	const handleButtonClick: EventHandler<Event, HTMLAnchorElement | HTMLButtonElement> = () => {
		fileInput.click();
	};

	const handleFileChange: EventHandler<Event, HTMLInputElement> = (e) => {
		const file = e.currentTarget.files?.[0];
		if (file) {
			fileName = file.name;
			previewUrl = URL.createObjectURL(file);
		}
	};

	const handleRemove: EventHandler<Event, HTMLButtonElement> = () => {
		fileName = null;
		previewUrl = null;
		fileInput.value = '';
	};
</script>

<div>
	<div class="inline-flex items-center space-x-2 rtl:space-x-reverse">
		<div
			class="border-input relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
			role="img"
			aria-label={previewUrl ? 'Preview of uploaded file' : 'Default user avatar'}
		>
			{#if previewUrl}
				<img
					class="h-full w-full object-cover"
					src={previewUrl}
					alt="Preview of uploaded file"
					width="32"
					height="32"
				/>
			{:else}
				<div aria-hidden="true">
					<IconCircleUserRound class="opacity-60" size={16} stroke-width="2" />
				</div>
			{/if}
		</div>
		<div class="relative inline-block">
			<Button onclick={handleButtonClick}>
				{fileName ? 'Change image' : 'Upload image'}
			</Button>
			<input
				type="file"
				bind:this={fileInput}
				onchange={handleFileChange}
				bind:files
				class="hidden"
				accept="image/*"
				aria-label="Upload image file"
			/>
		</div>
	</div>
	{#if fileName}
		<div class="mt-2 inline-flex gap-2 text-xs">
			<p class="text-muted-foreground truncate" aria-live="polite">
				{fileName}
			</p>
			<button
				onclick={handleRemove}
				class="font-medium text-red-500 hover:underline"
				aria-label={`Remove ${fileName}`}
			>
				Remove
			</button>
		</div>
	{/if}
	<div class="sr-only" aria-live="polite" role="status">
		{previewUrl ? 'Image uploaded and preview available' : 'No image uploaded'}
	</div>
</div>
