<script>
	export let item;
	export let key;
	const map = { a: 0 };

	function write() {
		item[map.a] = 1;
		item[`${key}`] = 2;
		item[key + 1] = 3;
		item[key] = 4;
	}
</script>

<button on:click={write}>write</button>
