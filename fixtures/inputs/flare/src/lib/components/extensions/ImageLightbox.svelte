<script lang="ts">
	import { Button } from '../ui/button';
	import { X } from '@lucide/svelte';

	type Props = {
		imageUrl: string;
		onClose: () => void;
	};

	let { imageUrl, onClose }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
	}
</script>

<div
	role="dialog"
	aria-modal="true"
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
	onclick={onClose}
	tabindex={0}
	onkeydown={handleKeydown}
>
	<img src={imageUrl} alt="Expanded screenshot" class="max-h-[80vh] max-w-[80vw] object-contain" />
	<Button
		variant="ghost"
		size="icon"
		class="absolute top-4 right-4 text-white hover:text-white"
		onclick={onClose}
	>
		<X class="size-6" />
	</Button>
</div>
