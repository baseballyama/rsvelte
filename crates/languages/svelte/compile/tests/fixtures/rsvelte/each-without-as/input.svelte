<script>
	let { items = [], count = 2 } = $props();
	let item = $state('outer');
</script>

{#each items}<p>{item}</p>{/each}
{#each items, i}<p>{i}</p>{/each}
{#each { length: count }, i}<span>{i}</span>{:else}none{/each}
{#each { length: 3 }}<b>y</b>{/each}
