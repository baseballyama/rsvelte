<script lang="ts">
	import { onMount } from 'svelte';
	import {
		initCompiler,
		getVersion,
		parse,
		compileClient,
		compileServer,
		type CompileMode,
		type OutputTab,
		type CompileStats
	} from '$lib/compiler';

	let input = $state(`<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}
<\/script>

<button onclick={increment}>
	Clicked {count} {count === 1 ? 'time' : 'times'}
</button>

<style>
	button {
		padding: 0.5rem 1rem;
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>`);

	let mode: CompileMode = $state('client');
	let activeTab: OutputTab = $state('js');
	let wasmReady = $state(false);
	let version = $state('');
	let error = $state('');

	let outputJs = $state('');
	let outputCss = $state('');
	let outputAst = $state('');
	let stats: CompileStats = $state({ compileTime: 0, outputSize: 0 });

	let debounceTimer: ReturnType<typeof setTimeout>;

	function compile() {
		if (!wasmReady) return;

		error = '';
		const startTime = performance.now();

		try {
			const result = mode === 'client'
				? compileClient(input, 'Component')
				: compileServer(input, 'Component');

			const endTime = performance.now();

			if (!result.success) {
				error = result.error || 'Compilation failed';
				return;
			}

			outputJs = result.js;
			outputCss = result.css || '/* No CSS */';

			// Parse for AST
			const parseResult = parse(input);
			if (parseResult.success) {
				try {
					const ast = JSON.parse(parseResult.ast);
					outputAst = JSON.stringify(ast, null, 2);
				} catch {
					outputAst = parseResult.ast;
				}
			} else {
				outputAst = parseResult.error || 'Parse error';
			}

			stats = {
				compileTime: endTime - startTime,
				outputSize: new Blob([result.js]).size
			};
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	function handleInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(compile, 300);
	}

	onMount(async () => {
		try {
			await initCompiler();
			wasmReady = true;
			version = getVersion();
			compile();
		} catch (e) {
			error = `Failed to load WASM: ${e instanceof Error ? e.message : String(e)}`;
		}
	});

	$effect(() => {
		if (wasmReady) {
			// Re-compile when mode changes
			mode;
			compile();
		}
	});
</script>

<div class="container">
	<header>
		<h1>Svelte Compiler Rust</h1>
		<span class="version">{version ? `v${version}` : 'Loading...'}</span>
		<div class="controls">
			<select bind:value={mode} disabled={!wasmReady}>
				<option value="client">Client</option>
				<option value="server">Server</option>
			</select>
			<button onclick={compile} disabled={!wasmReady}>Compile</button>
		</div>
	</header>

	<main>
		<div class="panel">
			<div class="panel-header">Input (.svelte)</div>
			<div class="panel-content">
				<textarea
					bind:value={input}
					oninput={handleInput}
					spellcheck="false"
					disabled={!wasmReady}
				></textarea>
			</div>
		</div>

		<div class="panel">
			<div class="panel-header">
				Output
				<div class="tabs">
					<button
						class="tab"
						class:active={activeTab === 'js'}
						onclick={() => (activeTab = 'js')}
					>
						JS
					</button>
					<button
						class="tab"
						class:active={activeTab === 'css'}
						onclick={() => (activeTab = 'css')}
					>
						CSS
					</button>
					<button
						class="tab"
						class:active={activeTab === 'ast'}
						onclick={() => (activeTab = 'ast')}
					>
						AST
					</button>
				</div>
			</div>
			<div class="panel-content">
				{#if !wasmReady && !error}
					<div class="loading">Loading WASM module...</div>
				{:else if error}
					<div class="error">{error}</div>
				{:else}
					<pre class:hidden={activeTab !== 'js'}>{outputJs}</pre>
					<pre class:hidden={activeTab !== 'css'}>{outputCss}</pre>
					<pre class:hidden={activeTab !== 'ast'}>{outputAst}</pre>
				{/if}
			</div>
			<div class="stats">
				<span>Compile time: {stats.compileTime.toFixed(2)}ms</span>
				<span>Output size: {stats.outputSize} bytes</span>
			</div>
		</div>
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
		background: #1a1a2e;
		color: #eee;
	}

	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		background: #16213e;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		border-bottom: 1px solid #0f3460;
	}

	header h1 {
		font-size: 1.5rem;
		color: #ff6b35;
	}

	.version {
		color: #888;
		font-size: 0.875rem;
	}

	.controls {
		margin-left: auto;
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	select,
	button {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: 1px solid #0f3460;
		background: #16213e;
		color: #eee;
		cursor: pointer;
		font-size: 0.875rem;
	}

	button {
		background: #ff6b35;
		border-color: #ff6b35;
		font-weight: 600;
	}

	button:hover:not(:disabled) {
		background: #e55a2b;
	}

	button:disabled {
		background: #555;
		border-color: #555;
		cursor: not-allowed;
	}

	main {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #0f3460;
	}

	.panel:last-child {
		border-right: none;
	}

	.panel-header {
		background: #16213e;
		padding: 0.75rem 1rem;
		font-weight: 600;
		font-size: 0.875rem;
		border-bottom: 1px solid #0f3460;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
	}

	.tab {
		padding: 0.25rem 0.75rem;
		background: transparent;
		border: 1px solid #0f3460;
		border-radius: 4px;
		cursor: pointer;
		color: #888;
		font-size: 0.75rem;
		font-weight: normal;
	}

	.tab.active {
		background: #0f3460;
		color: #eee;
	}

	.panel-content {
		flex: 1;
		overflow: auto;
		position: relative;
	}

	textarea,
	pre {
		width: 100%;
		height: 100%;
		padding: 1rem;
		background: #1a1a2e;
		color: #eee;
		border: none;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 14px;
		line-height: 1.5;
		resize: none;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	textarea:focus {
		outline: none;
	}

	pre {
		margin: 0;
		overflow: auto;
	}

	.hidden {
		display: none;
	}

	.error {
		color: #ff6b6b;
		padding: 1rem;
		background: rgba(255, 107, 107, 0.1);
		border-left: 3px solid #ff6b6b;
		margin: 1rem;
		border-radius: 4px;
		white-space: pre-wrap;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #888;
	}

	.stats {
		padding: 0.5rem 1rem;
		background: #16213e;
		border-top: 1px solid #0f3460;
		font-size: 0.75rem;
		color: #888;
		display: flex;
		gap: 2rem;
	}
</style>
