<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Textarea with no resize</Label>
	<Textarea id={uid} class="resize-none" placeholder="Leave a comment" />
</div>
