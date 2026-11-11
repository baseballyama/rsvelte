<script>
	let { cond, un } = $props();
	let obj = $state({ a: 0 });
	const v = (obj.a = 1);
</script>

{v}{cond}