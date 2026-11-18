<script lang="ts">
	let o: any = {};
	const f = <T,>(x: T): T => x;
</script>

<button type="button" on:click={() => f<string>("a")} on:click={() => f<string>('a')}>x</button>
<button type="button" on:click={() => o?.m?.()} on:click={() => o ?. m ?. ()}>y</button>
<button type="button" on:click={() => (o as string)} on:click={() => (o as string)}>z</button>
