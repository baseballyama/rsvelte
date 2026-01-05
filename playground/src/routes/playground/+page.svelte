<script lang="ts">
	import { onMount, untrack } from 'svelte';
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
	import { generatePreviewHtml } from '$lib/preview';
	import { DEFAULT_EXAMPLE } from '$lib/examples';
	import MonacoEditor from '$lib/monaco/MonacoEditor.svelte';
	import AstViewer from '$lib/components/AstViewer.svelte';

	let input = $state(DEFAULT_EXAMPLE);

	let mode: CompileMode = $state('client');
	let activeTab: OutputTab = $state('js');
	let wasmReady = $state(false);
	let version = $state('');
	let error = $state('');

	let outputJs = $state('');
	let outputCss = $state('');
	let outputAst = $state<object | null>(null);
	let outputAstString = $state('');
	let previewHtml = $state('');
	let stats: CompileStats = $state({ compileTime: 0, outputSize: 0 });

	// For bidirectional highlighting
	let cursorPosition = $state(0);
	let selectedAstRange = $state<{ start: number; end: number } | null>(null);

	let debounceTimer: ReturnType<typeof setTimeout>;
	let previewIframe: HTMLIFrameElement | undefined = $state();

	function compile() {
		if (!wasmReady) return;

		error = '';
		const startTime = performance.now();

		try {
			// Always compile client for preview
			const clientResult = compileClient(input, 'Component');

			const result = mode === 'client' ? clientResult : compileServer(input, 'Component');

			const endTime = performance.now();

			if (!result.success) {
				error = result.error || 'Compilation failed';
				previewHtml = '';
				return;
			}

			outputJs = result.js;
			outputCss = result.css || '/* No CSS */';

			// Generate preview HTML (always use client compilation)
			if (clientResult.success) {
				previewHtml = generatePreviewHtml(clientResult.js, clientResult.css || '');
			}

			// Parse for AST
			const parseResult = parse(input);
			if (parseResult.success) {
				try {
					outputAst = JSON.parse(parseResult.ast);
					outputAstString = JSON.stringify(outputAst, null, 2);
				} catch {
					outputAst = null;
					outputAstString = parseResult.ast;
				}
			} else {
				outputAst = null;
				outputAstString = parseResult.error || 'Parse error';
			}

			stats = {
				compileTime: endTime - startTime,
				outputSize: new Blob([result.js]).size
			};
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			previewHtml = '';
		}
	}

	function handleInputChange(value: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(compile, 300);
	}

	function handleCursorPositionChange(offset: number) {
		cursorPosition = offset;
		// Clear any manually selected AST range when cursor moves
		selectedAstRange = null;
	}

	function handleAstNodeClick(start: number, end: number) {
		selectedAstRange = { start, end };
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

	// Re-compile when mode changes
	$effect(() => {
		// Explicitly read mode to create dependency
		const currentMode = mode;
		if (wasmReady && currentMode) {
			// Use untrack to prevent compile() from adding its internal reads as dependencies
			untrack(() => compile());
		}
	});

	const outputLanguage = $derived(
		activeTab === 'js' ? 'javascript' : activeTab === 'css' ? 'css' : 'json'
	);

	const outputValue = $derived(
		activeTab === 'js' ? outputJs : activeTab === 'css' ? outputCss : outputAstString
	);

	// Highlight range for AST viewer (based on cursor position)
	const astHighlightRange = $derived<{ start: number; end: number } | null>(
		activeTab === 'ast' ? { start: cursorPosition, end: cursorPosition } : null
	);

	// Highlight range for input editor (based on AST node selection)
	const inputHighlightRange = $derived<{ start: number; end: number } | null>(selectedAstRange);
</script>

<svelte:head>
	<title>Playground | Svelte Compiler Rust</title>
</svelte:head>

<div class="container">
	<header>
		<a href=".." class="logo">
			<h1>Svelte Compiler Rust</h1>
		</a>
		<span class="version">{version ? `v${version}` : 'Loading...'}</span>
		<div class="controls">
			<select bind:value={mode} disabled={!wasmReady}>
				<option value="client">Client</option>
				<option value="server">Server</option>
			</select>
		</div>
	</header>

	<main>
		<div class="panel">
			<div class="panel-header">Input (.svelte)</div>
			<div class="panel-content editor-panel">
				{#if wasmReady}
					<MonacoEditor
						bind:value={input}
						onchange={handleInputChange}
						onCursorPositionChange={handleCursorPositionChange}
						highlightRange={inputHighlightRange}
					/>
				{:else}
					<div class="loading">Loading editor...</div>
				{/if}
			</div>
		</div>

		<div class="panel">
			<div class="panel-header">
				Output
				<div class="tabs">
					<button class="tab" class:active={activeTab === 'js'} onclick={() => (activeTab = 'js')}>
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
			<div class="panel-content editor-panel">
				{#if !wasmReady && !error}
					<div class="loading">Loading WASM module...</div>
				{:else if error}
					<div class="error">{error}</div>
				{:else if activeTab === 'ast'}
					<AstViewer
						ast={outputAst}
						highlightRange={astHighlightRange}
						onNodeClick={handleAstNodeClick}
					/>
				{:else}
					{#key `${activeTab}-${mode}-${outputValue}`}
						<MonacoEditor value={outputValue} language={outputLanguage} readonly={true} />
					{/key}
				{/if}
			</div>
			<div class="stats">
				<span>Compile time: {stats.compileTime.toFixed(2)}ms</span>
				<span>Output size: {stats.outputSize} bytes</span>
			</div>
		</div>

		<div class="panel preview-panel">
			<div class="panel-header">Preview</div>
			<div class="panel-content preview-content">
				{#if !wasmReady && !error}
					<div class="loading">Loading...</div>
				{:else if error}
					<div class="error">{error}</div>
				{:else if previewHtml}
					<iframe
						bind:this={previewIframe}
						srcdoc={previewHtml}
						title="Preview"
						sandbox="allow-scripts allow-popups allow-forms"
					></iframe>
				{:else}
					<div class="loading">No preview available</div>
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #1a1a2e;
	}

	header {
		background: #16213e;
		padding: 0.75rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		border-bottom: 1px solid #0f3460;
	}

	.logo {
		text-decoration: none;
	}

	.logo:hover h1 {
		opacity: 0.8;
	}

	header h1 {
		font-size: 1.25rem;
		color: #ff6b35;
		transition: opacity 0.2s;
	}

	.version {
		color: #888;
		font-size: 0.875rem;
	}

	.controls {
		margin-left: auto;
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	select {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid #0f3460;
		background: #16213e;
		color: #eee;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	select:hover {
		border-color: #ff6b35;
	}

	select:disabled {
		opacity: 0.5;
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
		min-width: 0;
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
		color: #eee;
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

	.tab:hover {
		color: #eee;
		border-color: #ff6b35;
	}

	.tab.active {
		background: #0f3460;
		color: #eee;
	}

	.panel-content {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.editor-panel {
		background: #1a1a2e;
	}

	.error {
		color: #ff6b6b;
		padding: 1rem;
		background: rgba(255, 107, 107, 0.1);
		border-left: 3px solid #ff6b6b;
		margin: 1rem;
		border-radius: 4px;
		white-space: pre-wrap;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 13px;
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

	.preview-panel {
		flex: 1;
	}

	.preview-content {
		background: white;
	}

	.preview-content iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>
