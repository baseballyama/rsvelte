<script>
	let pending = Promise.resolve(1);
</script>

{#await /* leading */ pending then value}{value}{/await}
