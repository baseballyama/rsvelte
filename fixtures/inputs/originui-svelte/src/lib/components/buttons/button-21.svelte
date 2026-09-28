<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Plus from '@lucide/svelte/icons/plus';

	let open = $state(false);

	function toggleOpen() {
		open = !open;
	}
</script>

<Button
	class="group rounded-full"
	variant="outline"
	size="icon"
	onclick={toggleOpen}
	aria-expanded={open}
	aria-label={open ? 'Close menu' : 'Open menu'}
>
	<Plus
		class="transition-transform duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] group-aria-expanded:rotate-135"
		size={16}
		aria-hidden="true"
	/>
</Button>
