<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Textarea with gray background</Label>
	<Textarea
		id={uid}
		class="bg-muted border-transparent shadow-none"
		placeholder="Leave a comment"
	/>
</div>
