<script>
	let status = $state('loading');
	let attempt = $state(0);

	const sections = [
		{ id: 'a', title: 'Intro', items: ['one', 'two', 'three'] },
		{ id: 'b', title: 'Details', items: ['alpha', 'beta'] },
		{ id: 'c', title: 'Outro', items: [] }
	];

	function load() {
		attempt += 1;
		return new Promise((resolve, reject) => {
			if (attempt % 3 === 0) {
				reject(new Error('Network error'));
			} else {
				resolve({ name: 'Report', generated: attempt });
			}
		});
	}

	let promise = $state(load());

	function retry() {
		promise = load();
	}

	const notice = '<strong>Heads up:</strong> rendered as raw HTML.';
</script>

<div class="app">
	{#if status === 'loading'}
		<p class="muted">Choose a state…</p>
	{:else if status === 'ready'}
		<p class="ok">Ready to go.</p>
	{:else}
		<p class="error">Something is off.</p>
	{/if}

	<div class="controls">
		{#each ['loading', 'ready', 'error'] as s}
			<button class:active={status === s} onclick={() => (status = s)}>{s}</button>
		{/each}
	</div>

	<div class="raw">{@html notice}</div>

	{#key attempt}
		<div class="panel">
			{#await promise}
				<p>Loading attempt {attempt}…</p>
			{:then data}
				<p>Loaded <b>{data.name}</b> (gen {data.generated})</p>
			{:catch error}
				<p class="error">Failed: {error.message}</p>
				<button onclick={retry}>Retry</button>
			{/await}
		</div>
	{/key}

	{#each sections as section (section.id)}
		<section>
			<h3>{section.title}</h3>
			{#if section.items.length}
				<ol>
					{#each section.items as item, i}
						<li>{i + 1}. {item}</li>
					{/each}
				</ol>
			{:else}
				<p class="muted">Empty section.</p>
			{/if}
		</section>
	{/each}
</div>

<style>
	.app {
		display: grid;
		gap: 1rem;
	}

	.muted {
		color: #9ca3af;
	}

	.ok {
		color: #16a34a;
	}

	.error {
		color: #dc2626;
	}

	.controls button.active {
		font-weight: 700;
	}
</style>
