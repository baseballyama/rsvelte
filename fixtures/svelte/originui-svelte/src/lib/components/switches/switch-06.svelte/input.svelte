<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	const uid = $props.id();
</script>

<div class="inline-flex items-center gap-2">
	<Switch id={uid} class="[&_span]:border-input h-3 w-9 border-none [&_span]:border" />
	<Label for={uid} class="sr-only">M2-style switch</Label>
</div>
