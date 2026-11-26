<script>
	let editable = $state(true);
	let html = $state('');
</script>

<div contenteditable={editable} bind:innerHTML={html}></div>
