<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Trash from '@lucide/svelte/icons/trash';
</script>

<Button variant="destructive">
	<Trash class="-ms-1 opacity-60" size={16} aria-hidden="true" />
	Button
</Button>
