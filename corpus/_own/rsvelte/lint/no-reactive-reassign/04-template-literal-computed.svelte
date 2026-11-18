<script>
	export let count;
	$: list = count ? [1] : [2];
	function mutate() {
		list[`push`](4);
	}
</script>

<button on:click={mutate}>{list.length}</button>
