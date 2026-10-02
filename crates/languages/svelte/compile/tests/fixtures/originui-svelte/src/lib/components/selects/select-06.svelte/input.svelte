<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import SelectNative from '$lib/components/ui/select-native.svelte';

	const uid = $props.id();
</script>

<div class="[&_svg]:text-destructive/80 space-y-2">
	<Label for={uid}>Select with error (native)</Label>
	<SelectNative
		id={uid}
		class="border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20"
	>
		<option value="s1">Svelte</option>
		<option value="s2">Next.js</option>
		<option value="s3">Astro</option>
		<option value="s4">Gatsby</option>
	</SelectNative>
	<p class="text-destructive mt-2 text-xs" role="alert" aria-live="polite">
		Selected option is invalid
	</p>
</div>
