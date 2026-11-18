<script>
	let { q = $bindable(5) } = $props();
	let a = $state(q);
	console.log(a);
</script>