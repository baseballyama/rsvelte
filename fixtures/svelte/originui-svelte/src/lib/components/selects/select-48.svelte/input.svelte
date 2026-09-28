<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import SelectNative from '$lib/components/ui/select-native.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Multiple select (native)</Label>
	<div class="border-input overflow-hidden rounded-lg border">
		<SelectNative id={uid} class="rounded-none border-none" multiple value="">
			<option value="s1">React</option>
			<option value="s2">Next.js</option>
			<option value="s3">Astro</option>
			<option value="s4">Gatsby</option>
			<option value="s5">Vue</option>
			<option value="s6">Angular</option>
		</SelectNative>
	</div>
</div>
