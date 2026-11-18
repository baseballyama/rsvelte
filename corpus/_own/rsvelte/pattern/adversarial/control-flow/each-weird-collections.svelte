<script>
	let n = $state(3);
</script>

{#each { length: n } as _, i}
	<span>{i}</span>
{/each}

{#each new Array(n).fill(0) as zero, i (i)}
	<span>{zero}</span>
{/each}

{#each [...Array(n).keys()].map((k) => k * 2) as even}
	<em>{even}</em>
{/each}

{#each n > 2 ? [1, 2] : [] as x}
	<b>{x}</b>
{:else}
	<i>empty</i>
{/each}
