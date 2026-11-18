<script>
	let objs = [{ a: 1, b: 2 }];
	let arrs = [[1, 2, 3]];
</script>

{#each objs as { a, ...rest }}
	<span>{a}{Object.keys(rest).length}</span>
{/each}
{#each arrs as [first = 0, ...others]}
	<span>{first}{others.length}</span>
{/each}
