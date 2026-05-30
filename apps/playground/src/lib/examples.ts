/**
 * Default example code shown in the playground on initial load.
 *
 * The example deliberately touches a wide slice of Svelte 5: every rune
 * ($state, $derived, $derived.by, $effect), runes-in-classes, snippets,
 * keyed each blocks with an :else branch, bind:value / bind:checked,
 * class: and style: directives, and an $effect-driven RAF loop.
 */
export const DEFAULT_EXAMPLE = `<script>
	// ── $state ────────────────────────────────────────
	let nextId = $state(4);
	let query  = $state('');
	let filter = $state('all'); // 'all' | 'open' | 'done'
	let todos  = $state([
		{ id: 1, text: 'Read the rsvelte source', done: true  },
		{ id: 2, text: 'Try {#snippet} blocks',   done: false },
		{ id: 3, text: 'Wire $effect to RAF',     done: false }
	]);

	// ── $derived / $derived.by ────────────────────────
	const visible = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return todos.filter((t) => {
			if (filter === 'open' && t.done) return false;
			if (filter === 'done' && !t.done) return false;
			return !q || t.text.toLowerCase().includes(q);
		});
	});
	const remaining = $derived(todos.filter((t) => !t.done).length);

	// ── runes inside a class ──────────────────────────
	class Stopwatch {
		elapsed = $state(0);
		running = $state(false);
		toggle() { this.running = !this.running; }
		reset()  { this.elapsed = 0; }
	}
	const watch = new Stopwatch();

	// ── $effect with cleanup, driven by watch.running ─
	$effect(() => {
		if (!watch.running) return;
		let last = performance.now();
		let id = requestAnimationFrame(function tick(now) {
			watch.elapsed += now - last;
			last = now;
			id = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(id);
	});

	function add(e) {
		e.preventDefault();
		const text = e.target.text.value.trim();
		if (!text) return;
		todos.push({ id: nextId++, text, done: false });
		e.target.reset();
	}

	function remove(id) {
		todos = todos.filter((t) => t.id !== id);
	}
</script>

<!-- reusable filter pill, declared once and rendered three times -->
{#snippet pill(label, value, active, on)}
	<button type="button" class="pill" class:active={active} onclick={on}>
		{label}<span>{value}</span>
	</button>
{/snippet}

<section>
	<header>
		<h1>rsvelte <em>· runes demo</em></h1>
		<p class="hint">$state · $derived · $effect · #snippet · class reactivity</p>
	</header>

	<div class="watch" class:running={watch.running}>
		<code>{(watch.elapsed / 1000).toFixed(2)}s</code>
		<button onclick={() => watch.toggle()}>{watch.running ? 'Pause' : 'Start'}</button>
		<button onclick={() => watch.reset()} disabled={watch.elapsed === 0}>Reset</button>
	</div>

	<form onsubmit={add}>
		<input name="text" placeholder="Add a task…" autocomplete="off" />
		<button>Add</button>
	</form>

	<div class="bar">
		<input bind:value={query} placeholder="Filter by text…" />
		<div class="tabs">
			{@render pill('All',  todos.length,             filter === 'all',  () => (filter = 'all'))}
			{@render pill('Open', remaining,                filter === 'open', () => (filter = 'open'))}
			{@render pill('Done', todos.length - remaining, filter === 'done', () => (filter = 'done'))}
		</div>
	</div>

	<ul>
		{#each visible as todo (todo.id)}
			<li class:done={todo.done}>
				<input type="checkbox" bind:checked={todo.done} />
				<span>{todo.text}</span>
				<button class="x" onclick={() => remove(todo.id)} aria-label="Remove">×</button>
			</li>
		{:else}
			<li class="empty">— nothing matches —</li>
		{/each}
	</ul>

	<footer>
		{#if remaining > 0}
			<strong>{remaining}</strong> open · {todos.length - remaining} done
		{:else if todos.length}
			✓ all done
		{:else}
			add something to begin
		{/if}
	</footer>
</section>

<style>
	section { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 34rem; color: #1a1612; }
	header  { margin-bottom: 1rem; }
	h1      { font-size: 1.3rem; font-weight: 500; margin: 0; letter-spacing: -0.01em; }
	h1 em   { color: #ff3e00; font-style: italic; font-weight: 400; }
	.hint   { color: #888; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 0.25rem; }

	.watch {
		display: flex; align-items: center; gap: 0.5rem;
		padding: 0.55rem 0.7rem; margin: 0.8rem 0;
		border: 1px dashed #d9cdb6; background: #faf3e3;
		font-variant-numeric: tabular-nums;
		transition: border-color 0.2s, background 0.2s;
	}
	.watch.running { border-style: solid; border-color: #ff3e00; background: #fff6ee; }
	.watch code    { flex: 1; font-family: ui-monospace, SFMono-Regular, monospace; font-weight: 600; }

	form { display: flex; gap: 0.4rem; margin: 0.6rem 0; }
	form input  { flex: 1; padding: 0.45rem 0.6rem; border: 1px solid #d9cdb6; background: white; font: inherit; }
	form button { padding: 0.45rem 0.95rem; background: #1a1612; color: white; border: 0; cursor: pointer; font: inherit; }

	.bar    { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin: 0.8rem 0; }
	.bar input { flex: 1; min-width: 10rem; padding: 0.4rem 0.55rem; border: 1px solid #d9cdb6; background: white; font: inherit; }
	.tabs   { display: flex; gap: 0.25rem; }

	.pill {
		padding: 0.32rem 0.6rem;
		border: 1px solid #d9cdb6; background: white;
		cursor: pointer; font: inherit; font-size: 0.78rem;
	}
	.pill span        { margin-left: 0.35rem; color: #999; font-variant-numeric: tabular-nums; }
	.pill.active      { background: #1a1612; color: white; border-color: #1a1612; }
	.pill.active span { color: #b8ab93; }

	ul { list-style: none; padding: 0; margin: 0; border-top: 1px solid #ece1c8; }
	li { display: flex; align-items: center; gap: 0.55rem; padding: 0.5rem 0; border-bottom: 1px solid #ece1c8; }
	li.done span { text-decoration: line-through; color: #b0a690; }
	li.empty     { color: #b0a690; justify-content: center; font-style: italic; }
	li > span    { flex: 1; }

	.x        { background: transparent; border: 0; color: #b0a690; cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0 0.25rem; }
	.x:hover  { color: #b1280a; }

	footer        { margin-top: 0.9rem; font-size: 0.8rem; color: #7a7062; font-variant-numeric: tabular-nums; }
	footer strong { color: #1a1612; }
</style>`;
