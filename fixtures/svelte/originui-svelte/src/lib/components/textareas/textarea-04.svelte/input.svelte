<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="mb-2 flex items-center justify-between gap-1">
	<Label for={uid} class="mb-0">Textarea with hint</Label>
	<span class="text-muted-foreground text-sm">Optional</span>
</div>
<Textarea id={uid} placeholder="Leave a comment" />
