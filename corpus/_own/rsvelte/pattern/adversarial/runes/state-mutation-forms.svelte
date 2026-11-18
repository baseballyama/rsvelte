<script>
	let arr = $state([1, 2, 3]);
	let obj = $state({ a: 1, dyn: {} });
	let key = $state('a');

	function mutate() {
		arr.push(4);
		arr.splice(0, 1);
		arr.length = Math.min(arr.length, 2);
		arr[arr.length - 1] += 1;
		delete obj.dyn;
		obj[key]++;
		obj[`${key}x`] = (obj[`${key}x`] ?? 0) + 1;
		[arr[0], arr[1]] = [arr[1], arr[0]];
		({ [key]: obj.a = 0 } = obj);
	}
</script>

<button onclick={mutate}>{arr.join(',')}:{obj.a}</button>
