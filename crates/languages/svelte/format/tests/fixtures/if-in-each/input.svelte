<script>
	let tasks = $state([
		{ text: 'write', done: true },
		{ text: 'test', done: false }
	]);
</script>

{#each tasks as task}
	{#if task.done}
		<s>{task.text}</s>
	{:else}
		<b>{task.text}</b>
	{/if}
{/each}
