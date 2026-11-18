<script>
	let value = $state('');
	let note = $state('');
</script>

<textarea bind:value>a {note} b</textarea>
<textarea bind:value={note}>
	{value}</textarea>
<textarea>{value}</textarea>
<textarea bind:value={() => note, (v) => (note = v)}>{value}</textarea>
