<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Plus from '@lucide/svelte/icons/plus';
</script>

<Button class="rounded-full" variant="outline" size="icon" aria-label="Add new item">
	<Plus size={16} aria-hidden="true" />
</Button>
