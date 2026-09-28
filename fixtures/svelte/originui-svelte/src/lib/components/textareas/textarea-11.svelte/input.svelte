<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Textarea with right button</Label>
	<Textarea id={uid} placeholder="Leave a comment" />
	<div class="flex justify-end">
		<Button variant="outline">Send</Button>
	</div>
</div>
