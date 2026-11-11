<script>
	export let selected;
	let out = null;
	let done = false;

	function pick(result) {
		;[selected] = result
		done = true
	}

	function keep(result) {
		out = ([selected] = result);
	}
</script>

<button on:click={() => pick([1])}>{selected}{out}{done}</button>
<button on:click={() => keep([2])}>{selected}</button>
