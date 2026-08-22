<script>
	export let count;
	$: item = count;
	function churn(arr, o) {
		for (item of arr) {
			void item;
		}
		({ d: item } = o);
		[item] = arr;
	}
</script>

<button on:click={() => churn([1], { d: 2 })}>{item}</button>
