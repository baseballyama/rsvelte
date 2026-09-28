<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Plus from '@lucide/svelte/icons/plus';
</script>

<Button variant="outline" class="aspect-square max-sm:p-0">
	<Plus class="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
	<span class="max-sm:sr-only">Add new</span>
</Button>
