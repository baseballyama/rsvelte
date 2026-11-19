<script>
	let focused = $state(false);
</script>

<input bind:focused={focused} />
<svelte:window bind:focused={focused} />
<svelte:document bind:focused={focused} />
