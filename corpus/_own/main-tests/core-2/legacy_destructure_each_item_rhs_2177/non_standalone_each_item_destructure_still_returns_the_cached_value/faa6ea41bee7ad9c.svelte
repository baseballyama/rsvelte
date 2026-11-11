<script>
	let list = [{ a: 1, b: 2 }];
	let x, y, out;
</script>
{#each list as item}
	<button onclick={() => { out = ({ a: x, b: y } = item); }}>{item}</button>
{/each}
{x} {y} {JSON.stringify(out)}