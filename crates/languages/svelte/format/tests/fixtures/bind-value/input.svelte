<script>
	let name = $state('world');
</script>

<input bind:value={name} />
<p>Hello {name}!</p>
