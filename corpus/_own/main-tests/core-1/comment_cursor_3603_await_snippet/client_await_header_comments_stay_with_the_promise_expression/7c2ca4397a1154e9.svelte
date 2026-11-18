<script>
	let pending = Promise.resolve(1);
</script>

{#await pending /* trailing */ then value}{value}{/await}
