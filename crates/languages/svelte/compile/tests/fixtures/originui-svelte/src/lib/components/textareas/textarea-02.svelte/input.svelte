<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>
		Required textarea <span class="text-destructive">*</span>
	</Label>
	<Textarea id={uid} placeholder="Leave a message" required />
</div>
