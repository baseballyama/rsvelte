<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';

	const uid = $props.id();
</script>

<div class="flex items-center gap-2">
	<Checkbox id={uid} />
	<Label for={uid}>
		I agree to the
		<a class="underline" href="https://originui.com" target="_blank" rel="noopener noreferrer">
			terms of service
		</a>
	</Label>
</div>
