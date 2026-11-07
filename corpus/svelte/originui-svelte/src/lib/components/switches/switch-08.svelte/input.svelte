<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	let checked = $state(true);

	const uid = $props.id();
</script>

<div class="inline-flex items-center gap-2">
	<Switch id={uid} bind:checked aria-label="Toggle switch" />
	<Label for={uid} class="text-sm font-medium">
		{checked ? 'On' : 'Off'}
	</Label>
</div>
