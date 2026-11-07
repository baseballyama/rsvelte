<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Textarea with error</Label>
	<Textarea
		id={uid}
		class="border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/30"
		placeholder="Leave a comment"
		value="Hello!"
	/>
	<p class="text-destructive mt-2 text-xs" role="alert" aria-live="polite">
		Message should be at least 10 characters
	</p>
</div>
