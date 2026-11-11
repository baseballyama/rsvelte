<script>
	let items = $state([1]);
	let flag = $state(true);
	let str = $state('x');
</script>
<svelte:element this={"div"}>{@debug}</svelte:element>