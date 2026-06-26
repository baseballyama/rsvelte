<script>
	let nextId = $state(4);
	let draft = $state('');
	let filter = $state('all');

	let todos = $state([
		{ id: 1, text: 'Learn Svelte', done: true },
		{ id: 2, text: 'Build something', done: false },
		{ id: 3, text: 'Ship it', done: false }
	]);

	let remaining = $derived(todos.filter((t) => !t.done).length);
	let visible = $derived(
		todos.filter((t) => {
			if (filter === 'active') return !t.done;
			if (filter === 'completed') return t.done;
			return true;
		})
	);

	function add() {
		const text = draft.trim();
		if (!text) return;
		todos = [...todos, { id: nextId++, text, done: false }];
		draft = '';
	}

	function toggle(id) {
		todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
	}

	function remove(id) {
		todos = todos.filter((t) => t.id !== id);
	}

	function clearCompleted() {
		todos = todos.filter((t) => !t.done);
	}
</script>

<section class="todo">
	<header>
		<h1>Todos</h1>
		<span class="count">{remaining} left</span>
	</header>

	<form onsubmit={(e) => { e.preventDefault(); add(); }}>
		<input placeholder="What needs doing?" bind:value={draft} />
		<button type="submit" disabled={!draft.trim()}>Add</button>
	</form>

	<nav class="filters">
		{#each ['all', 'active', 'completed'] as name}
			<button class:active={filter === name} onclick={() => (filter = name)}>
				{name}
			</button>
		{/each}
	</nav>

	{#if visible.length === 0}
		<p class="empty">Nothing here.</p>
	{:else}
		<ul>
			{#each visible as todo (todo.id)}
				<li class:done={todo.done}>
					<label>
						<input type="checkbox" checked={todo.done} onchange={() => toggle(todo.id)} />
						{todo.text}
					</label>
					<button class="remove" onclick={() => remove(todo.id)}>×</button>
				</li>
			{/each}
		</ul>
	{/if}

	<footer>
		<button onclick={clearCompleted}>Clear completed</button>
	</footer>
</section>

<style>
	.todo {
		max-width: 32rem;
		margin: 0 auto;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	li.done label {
		text-decoration: line-through;
		opacity: 0.6;
	}

	.filters button.active {
		font-weight: 700;
	}
</style>
