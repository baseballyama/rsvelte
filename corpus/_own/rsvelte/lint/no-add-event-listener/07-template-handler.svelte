<script>
	let el;
</script>

<div bind:this={el}>a</div>
<button on:click={() => el.addEventListener('focus', () => {})}>x</button>
<svelte:window on:keydown={() => addEventListener('paste', console.log)} />
