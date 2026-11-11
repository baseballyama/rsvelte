<script>
	let p = $state(Promise.resolve(1));
	/* tail */
</script>

{#await p}<p>pending</p>{/await}
