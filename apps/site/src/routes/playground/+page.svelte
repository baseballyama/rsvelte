<script lang="ts">
	import { onMount } from 'svelte';
	import { example, load, operations, view, type Operation, type Result } from '#lib/playground.ts';

	let source = $state(example);
	let operation: Operation = $state('compile-client');
	let run: ((source: string, operation: Operation) => Result) | undefined = $state();
	let failure = $state('');

	onMount(() => {
		load().then(
			(loaded) => (run = loaded),
			(error: unknown) => (failure = String(error)),
		);
	});

	const result = $derived(run?.(source, operation));
</script>

<svelte:head>
	<title>プレイグラウンド ・ rsvelte</title>
</svelte:head>

<h1>プレイグラウンド</h1>

<p>
	Svelte コンポーネントを書くと、rsvelte の結果がすぐに表示されます。WebAssembly にビルドした
	rsvelte がブラウザの中で動きます。型検査は TypeScript の型検査器が要るため、ここでは動きません。
</p>

<div class="operations" role="radiogroup" aria-label="処理">
	{#each operations as option (option.id)}
		<label>
			<input type="radio" name="operation" value={option.id} bind:group={operation} />
			{option.label}
		</label>
	{/each}
</div>

<div class="panes">
	<textarea bind:value={source} spellcheck="false" aria-label="App.svelte の内容"></textarea>
	<div class="output" aria-live="polite">
		{#if failure}
			<p>読み込みに失敗しました：{failure}</p>
		{:else if !result}
			<p class="muted">読み込み中です。</p>
		{:else if !result.ok}
			<p>エラー：{result.message}</p>
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
					<pre>{file.text}</pre>
				{/each}
				{#if operation === 'lint' && shown.problems.length === 0}
					<p class="muted">問題は見つかりませんでした。</p>
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
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 1rem;
	}

	textarea {
		width: 100%;
		min-height: 28rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--line);
		border-radius: 8px;
		color: inherit;
		background: var(--code-bg);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.9em;
		line-height: 1.55;
		resize: vertical;
	}

	.output {
		min-width: 0;
	}

	.output pre {
		margin-top: 0;
	}

	.problem {
		margin: 0 0 0.5rem;
	}
</style>
