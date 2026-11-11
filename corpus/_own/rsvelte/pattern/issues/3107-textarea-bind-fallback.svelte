<script>
	let value = $state('');
	let note = $state('');
</script>

<textarea bind:value>fallback</textarea>
<textarea bind:value={note}>{value || 'derived fallback'}</textarea>
<div contenteditable bind:innerHTML={note}>editable fallback</div>
