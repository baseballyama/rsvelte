<script>
	let base = $state(1);
	let doubled = $derived(base * 2);

	function optimistic() {
		doubled = 99;
	}

	let history = $derived.by(() => [doubled]);

	function rewrite() {
		history = [...history, doubled];
	}
</script>

<button onclick={optimistic}>{doubled}</button>
<button onclick={rewrite}>{history.join(',')}</button>
