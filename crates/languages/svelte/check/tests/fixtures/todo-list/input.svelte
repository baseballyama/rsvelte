<script>
	let todos = $state([
		{ id: 1, text: 'Learn Svelte', done: true },
		{ id: 2, text: 'Build something', done: false }
	]);
	let draft = $state('');
	let nextId = 3;
	let remaining = $derived(todos.filter((t) => !t.done).length);

	function add() {
		if (!draft.trim()) return;
		todos.push({ id: nextId++, text: draft, done: false });
		draft = '';
	}

	function clear() {
		todos = todos.filter((t) => !t.done);
	}
</script>

<h1>Todos</h1>
<input bind:value={draft} placeholder="What needs doing?" />
<button onclick={add}>Add</button>

<ul>
	{#each todos as todo (todo.id)}
		<li>
			<input type="checkbox" bind:checked={todo.done} />
			<input bind:value={todo.text} />
			<button onclick={() => (todos = todos.filter((t) => t !== todo))}>x</button>
		</li>
	{:else}
		<li>Nothing to do.</li>
	{/each}
</ul>

<p>{remaining} remaining</p>
<button onclick={clear}>Clear completed</button>
