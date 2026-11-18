<script>
	export let page = 0;
	export let pages = [];
</script>

{#each pages as page (page.key)}<p>{page.value}</p>{/each}
{#each pages as item (item.key)}<p>{item.value}</p>{/each}
{#each pages as page, i (page.a.b)}<p>{page}{i}</p>{/each}
{#each pages as page ([page])}<p>{page}</p>{/each}
<p>{page}</p>
