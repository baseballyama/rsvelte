<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Read-only textarea</Label>
	<Textarea
		id={uid}
		class="read-only:bg-muted"
		value="This is a read-only textarea"
		readonly
		placeholder="Leave a comment"
	/>
</div>
