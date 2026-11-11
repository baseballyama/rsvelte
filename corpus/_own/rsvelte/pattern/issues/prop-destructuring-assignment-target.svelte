<script>
	export let items = [];
	export let obj = {};

	function swap(i, s) {
		[items[i], items[s]] = [items[s], items[i]];
	}

	function pick(src) {
		({ a: items[0] } = src);
	}

	function bump() {
		obj.count = 1;
	}
</script>

<button
	on:click={() => {
		swap(0, 1);
		pick({});
		bump();
	}}>{items.length}{obj.count}</button
>
