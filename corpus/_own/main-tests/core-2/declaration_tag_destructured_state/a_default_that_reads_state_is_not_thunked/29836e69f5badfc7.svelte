<script>
	let n = $state(1);
</script>
{let { a = n } = $state({})}
{const [x = n * 2] = $derived([])}
<p>{a}{x}</p>
<button onclick={() => { n++; a = 7; }}>x</button>
