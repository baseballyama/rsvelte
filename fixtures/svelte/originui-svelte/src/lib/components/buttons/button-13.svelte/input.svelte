<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
</script>

<Button disabled>
	<LoaderCircle class="-ms-1 animate-spin" size={16} aria-hidden="true" />
	Button
</Button>
