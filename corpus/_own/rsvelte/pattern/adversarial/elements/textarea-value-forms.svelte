<script>
	let v = $state('line1\nline2');
	let { ro = false } = $props();
</script>

<textarea bind:value={v}></textarea>
<textarea value={v} readonly={ro}></textarea>
<textarea>static
	multiline
	content</textarea>
<p>{v.length}</p>
