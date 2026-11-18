<script>
	let flag = $state(true);
	let rows = $state([1]);
</script>

{#await Promise.resolve(1) // c
then v}
	<b>{v}</b>
{/await}
