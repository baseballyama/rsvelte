<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';

	const maxLength = 180;
	const characterLimit = useCharacterLimit(maxLength);

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Textarea with characters left</Label>
	<Textarea
		id={uid}
		bind:value={characterLimit.value}
		maxlength={characterLimit.maxLength}
		aria-describedby="{uid}-characters-left-textarea"
	/>
	<p
		id="{uid}-characters-left-textarea"
		class="text-muted-foreground mt-2 text-right text-xs"
		role="status"
		aria-live="polite"
	>
		<span class="tabular-nums">{characterLimit.maxLength - characterLimit.characterCount}</span>
		characters left
	</p>
</div>
