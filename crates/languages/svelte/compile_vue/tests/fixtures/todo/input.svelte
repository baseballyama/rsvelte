<script>
  let todos = $state([{ id: 1, text: 'write tests', done: true }]);
  let draft = $state('');
  let next = 2;
  let remaining = $derived(todos.filter((t) => !t.done).length);

  function add(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    todos.push({ id: next++, text, done: false });
    draft = '';
  }

  function clearDone() {
    todos = todos.filter((t) => !t.done);
  }
</script>

<form class="new" onsubmit={add}>
  <input
    class="draft"
    bind:value={draft}
    placeholder="What needs doing?"
    onkeydown={(e) => {
      if (e.key === 'Escape') draft = '';
    }}
  /><button class="add" disabled={!draft.trim()}>add</button>
</form>
<ul class="todos">
  {#each todos as todo (todo.id)}
    <li class={{ done: todo.done }}>
      <label><input type="checkbox" bind:checked={todo.done} /> {todo.text}</label>
    </li>
  {/each}
</ul>
<p class="summary"><span>{remaining}</span> <span>{remaining === 1 ? 'item' : 'items'} left</span></p>
{#if todos.some((t) => t.done)}
  <button class="clear" onclick={clearDone}>clear done</button>
{/if}
