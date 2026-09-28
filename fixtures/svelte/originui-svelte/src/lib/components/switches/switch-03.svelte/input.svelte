<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	const uid = $props.id();
</script>

<div
	class="inline-flex items-center gap-2"
	style:--primary="238.7 83.5% 66.7%"
	style:--ring="238.7 83.5% 66.7%"
>
	<Switch id={uid} checked />
	<Label for={uid} class="sr-only">Colored switch</Label>
</div>
