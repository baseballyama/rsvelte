<script>
	let a = $state(0);
	let b = $state(0);
	let sum = $derived(add());

	function add() {
		return a + b;
	}
</script>

<button on:click={() => a++}>a++</button>
<button on:click={() => b++}>b++</button>
<p>{a} + {b} = {sum}</p>
