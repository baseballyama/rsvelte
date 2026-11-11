<script>
	export let obj;
	export let a;
	let mid;
	let tmp;
	$: obj.alpha = mid;
	$: mid = tmp;
	$: {
		obj.beta = a;
		tmp = a;
	}
</script>
