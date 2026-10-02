<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import SelectNative from '$lib/components/ui/select-native.svelte';

	const uid = $props.id();
</script>

<!-- NOTE: This inline style is to show how to set the --ring variable in your CSS file in order to change the focus ring color. -->
<div class="space-y-2" style="--ring: 234 89% 74%">
	<Label for={uid}>Select with colored border (native)</Label>
	<SelectNative id={uid}>
		<option value="s1">Svelte</option>
		<option value="s2">Next.js</option>
		<option value="s3">Astro</option>
		<option value="s4">Gatsby</option>
	</SelectNative>
</div>
