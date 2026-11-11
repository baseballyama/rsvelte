<script>
	let v = '';
	let active = true;
	const h = () => {};
</script>

<input bind:value={v} on:input|preventDefault|stopPropagation={h}>
<div class:active style:color="red">directive keys in messages</div>
<button on:click={h} use:h>use directive name</button>
