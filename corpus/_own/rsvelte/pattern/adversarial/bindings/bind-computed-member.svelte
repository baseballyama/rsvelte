<script>
	let form = $state({ x: '', y: '' });
	let which = $state(true);
	let idx = $state(0);
	let rows = $state([{ cells: ['', ''] }]);
</script>

<input bind:value={form[which ? 'x' : 'y']} />
<input bind:value={rows[idx].cells[idx + 1]} />
<input bind:value={form[`${which}`.slice(0, 1)]} />
<p>{form.x}:{form.y}:{rows[0].cells.join('|')}</p>
