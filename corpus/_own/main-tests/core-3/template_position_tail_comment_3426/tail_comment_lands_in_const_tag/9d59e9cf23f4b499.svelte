<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#each [1] as v}{@const c = b}{c}{/each}
