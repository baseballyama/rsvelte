<script>
	export let count;
	$: list = count ? [1] : [2];
	function mutate() {
		list.push(3);
		list?.pop();
		list['sort']();
		const copy = list.slice();
		void copy;
	}
</script>

<button on:click={mutate}>{list.length}</button>
