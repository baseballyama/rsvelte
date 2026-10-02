<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
</script>

<Button variant="ghost" class="h-auto p-0 hover:bg-transparent">
	<enhanced:img
		class="size-[40px] rounded-full"
		src="/static/avatar.jpg"
		alt="Profile image"
		loading="lazy"
		aria-hidden="true"
	/>

	<ChevronDown size={16} class="opacity-60" aria-hidden="true" />
</Button>
