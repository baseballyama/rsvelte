<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Disabled textarea</Label>
	<Textarea id={uid} disabled placeholder="Leave a comment" />
</div>
