<script>
	/* eslint svelte/sort-attributes: ["warn", { "order": [{ "match": "/^on:/u", "sort": "alphabetical" }] }] */
	let a = () => {};
	let b = () => {};
</script>

<button on:click|once={a} on:click|capture={b}>x</button>
<button on:keydown|preventDefault={a} on:click|once={b}>y</button>
