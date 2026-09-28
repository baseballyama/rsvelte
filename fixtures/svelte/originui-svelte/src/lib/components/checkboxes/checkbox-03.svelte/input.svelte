<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';

	const uid = $props.id();
</script>

<div
	class="flex items-center gap-2"
	style:--primary="238.7 83.5% 66.7%"
	style:--ring="238.7 83.5% 66.7%"
>
	<Checkbox id={uid} checked />
	<Label for={uid}>Colored checkbox</Label>
</div>
