<script>
	export let data;
	export let load;
</script>
<button
	on:click={async () => {
		let data = await load();
		if (data) {
			data.done = true;
		}
	}}>shadowed</button
>
<button on:click={() => (data.done = true)}>prop</button>
