<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';

	const uid = $props.id();
</script>

<div class="flex gap-6">
	<div class="flex items-center gap-2">
		<Checkbox id="{uid}-a" />
		<Label for="{uid}-a">Svelte</Label>
	</div>
	<div class="flex items-center gap-2">
		<Checkbox id="{uid}-b" />
		<Label for="{uid}-b">SvelteKit</Label>
	</div>
	<div class="flex items-center gap-2">
		<Checkbox id="{uid}-c" />
		<Label for="{uid}-c">Astro</Label>
	</div>
</div>
