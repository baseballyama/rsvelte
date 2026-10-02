<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Autogrowing textarea</Label>
	<Textarea
		id={uid}
		placeholder="Leave a comment"
		class="field-sizing-content max-h-29.5 min-h-[none] resize-none py-1.5"
	/>
</div>
