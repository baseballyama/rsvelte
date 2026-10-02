<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Sparkles from '@lucide/svelte/icons/sparkles';
</script>

<Button variant="outline">
	Button
	<Sparkles class="-me-1 opacity-60" size={16} aria-hidden="true" />
</Button>
