<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import VolumeIcon from '@lucide/svelte/icons/volume';
	import Volume1Icon from '@lucide/svelte/icons/volume-1';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import VolumeXIcon from '@lucide/svelte/icons/volume-x';

	let volume = $state(3);

	function decreaseVolume() {
		volume = Math.max(0, volume - 1);
	}

	function increaseVolume() {
		volume = Math.min(6, volume + 1);
	}

	// Reactive volume icon selection
	const Icon = $derived(
		volume === 0 ? VolumeXIcon : volume < 3 ? VolumeIcon : volume < 5 ? Volume1Icon : Volume2Icon
	);
</script>

<div class="inline-flex items-center" role="group" aria-labelledby="volume-control">
	<span id="volume-control" class="sr-only"> Volume Control </span>
	<Button
		class="rounded-full"
		variant="outline"
		size="icon"
		aria-label="Decrease volume"
		onclick={decreaseVolume}
		disabled={volume === 0}
	>
		<MinusIcon size={16} aria-hidden="true" />
	</Button>
	<div class="flex items-center px-3 text-sm font-medium tabular-nums" aria-live="polite">
		<Icon class="opacity-60" size={16} aria-hidden="true" />
		<span class="ms-2" aria-label="Current volume is {volume}">
			{volume}
		</span>
	</div>
	<Button
		class="rounded-full"
		variant="outline"
		size="icon"
		aria-label="Increase volume"
		onclick={increaseVolume}
		disabled={volume === 6}
	>
		<PlusIcon size={16} aria-hidden="true" />
	</Button>
</div>
