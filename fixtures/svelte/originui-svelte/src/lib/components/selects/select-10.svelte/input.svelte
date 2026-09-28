<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import SelectNative from '$lib/components/ui/select-native.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Select with auto-width (native)</Label>
	<div class="w-fit">
		<SelectNative id={uid}>
			<option value="s1">Svelte</option>
			<option value="s2">Next.js</option>
			<option value="s3">Astro</option>
			<option value="s4">Gatsby</option>
		</SelectNative>
	</div>
</div>
