<script lang="ts">
	import { onMount } from 'svelte';
	import { example, load, operations, view, type Operation, type Result } from '#lib/playground.ts';

	let source = $state(example);
	// Runs after typing pauses, so a fast typist does not wait for each keystroke's run.
	let settled = $state(example);
	let operation: Operation = $state('lint');
	let run: ((source: string, operation: Operation) => Result) | undefined = $state();
	let failure = $state('');

	onMount(() => {
		load().then(
			(loaded) => (run = loaded),
			(error: unknown) => (failure = String(error)),
		);
	});

	$effect(() => {
		const next = source;
		const timer = setTimeout(() => (settled = next), 150);
		return () => clearTimeout(timer);
	});

	const result = $derived(run?.(settled, operation));
</script>

<svelte:head>
	<title>Playground · rsvelte</title>
</svelte:head>

<h1>Playground</h1>

<p>
	Write a Svelte component to see rsvelte lint, format and compile it. rsvelte also has a Svelte
	compiler, which the <code>rsvelte</code> command does not include yet. Type checking does not run in
	a browser.
</p>

<div class="operations" role="radiogroup" aria-label="Operation">
	{#each operations as option (option.id)}
		<label>
			<input type="radio" name="operation" value={option.id} bind:group={operation} />
			{option.label}
		</label>
	{/each}
</div>

<div class="panes">
	<textarea bind:value={source} spellcheck="false" aria-label="Source of App.svelte"></textarea>
	<div class="output" aria-live="polite">
		{#if failure}
			<p>rsvelte did not load: {failure}</p>
		{:else if !result}
			<p class="muted">Loading…</p>
		{:else if !result.ok}
			<p>Error: {result.message}</p>
		{:else}
			{#each result.steps.map(view) as shown, i (i)}
				{#each shown.problems as problem, j (j)}
					<p class="problem">
						<code>{problem.line}:{problem.column}</code>
						{problem.message}
						<span class="muted">{problem.rule}</span>
					</p>
				{/each}
				{#each shown.files as file (file.name)}
					{#if shown.files.length > 1}<p class="muted">{file.name}</p>{/if}
					<pre>{file.text}</pre>
				{/each}
				{#if operation === 'lint' && shown.problems.length === 0}
					<p class="muted">No problems found.</p>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style>
	.operations {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		margin: 1rem 0;
	}

	.panes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
		gap: 1rem;
	}

	textarea {
		width: 100%;
		height: max(28rem, calc(100vh - 20rem));
		padding: 0.9rem 1rem;
		border: 1px solid var(--line);
		border-radius: 8px;
		color: inherit;
		background: var(--code-bg);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.9em;
		line-height: 1.55;
		resize: none;
	}

	.output {
		min-width: 0;
		height: max(28rem, calc(100vh - 20rem));
		overflow: auto;
	}

	.output pre {
		margin-top: 0;
	}

	@media (max-width: 50rem) {
		textarea {
			height: 24rem;
		}

		.output {
			height: auto;
		}
	}

	.problem {
		margin: 0 0 0.5rem;
	}
</style>
