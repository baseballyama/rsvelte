<script>
	let o = $state({});
	let xs = $state([]);
	let { 10n: big, [null]: none, ...derived } = $derived(o);
	let { 1.5: half, ...state } = $state({});
	let yes, regex, assigned;

	function assign(value) {
		({ [true]: yes, [/x/g]: regex, ...assigned } = value);
	}
</script>

{big}{none}{derived}{half}{state}{yes}{regex}{assigned}
{#each xs as { 1n: one, ['s']: s, ...item }}{one}{s}{item}{/each}
<button onclick={() => assign(o)}>x</button>
