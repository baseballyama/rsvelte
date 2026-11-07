<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import SelectNative from '$lib/components/ui/select-native.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Select with option groups (native)</Label>
	<SelectNative id={uid}>
		<optgroup label="Frontend">
			<option value="s1">Svelte</option>
			<option value="s2">Vue</option>
			<option value="s3">Angular</option>
		</optgroup>
		<optgroup label="Backend">
			<option value="s4">Node.js</option>
			<option value="s5">Python</option>
			<option value="s6">Java</option>
		</optgroup>
	</SelectNative>
</div>
