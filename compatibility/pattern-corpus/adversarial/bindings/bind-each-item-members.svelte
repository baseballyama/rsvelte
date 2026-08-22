<script>
	let todos = $state([{ text: 'a', done: false }]);
	let matrix = $state([[0, 1]]);
</script>

{#each todos as todo, i}
	<input bind:value={todo.text} />
	<input type="checkbox" bind:checked={todos[i].done} />
{/each}

{#each matrix as row, r}
	{#each row as _, c}
		<input type="number" bind:value={matrix[r][c]} />
	{/each}
{/each}
