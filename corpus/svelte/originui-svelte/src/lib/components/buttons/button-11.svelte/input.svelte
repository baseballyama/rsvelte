<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
</script>

<Button>
	Button
	<ChevronDown class="-me-1 opacity-60" size={16} aria-hidden="true" />
</Button>
