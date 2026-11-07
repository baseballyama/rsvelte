{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
