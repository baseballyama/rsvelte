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
	import SiteNav from '$lib/components/SiteNav.svelte';

	let input = $state(DEFAULT_EXAMPLE);

	let mode: CompileMode = $state('client');
	let activeTab: OutputTab = $state('result');
	let wasmReady = $state(false);
	let version = $state('');
	let error = $state('');

	let outputJs = $state('');
	let outputCss = $state('');
	let outputAst = $state<object | null>(null);
	let outputAstString = $state('');
	let previewHtml = $state('');
	let stats: CompileStats = $state({ compileTime: 0, outputSize: 0 });

	let cursorPosition = $state(0);
	let selectedAstRange = $state<{ start: number; end: number } | null>(null);

	let debounceTimer: ReturnType<typeof setTimeout>;

	function compile() {
		if (!wasmReady) return;

		error = '';
		const startTime = performance.now();

		try {
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

			if (clientResult.success) {
				previewHtml = generatePreviewHtml(clientResult.js, clientResult.css || '');
			}

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

	function handleInputChange() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(compile, 300);
	}

	function handleCursorPositionChange(offset: number) {
		cursorPosition = offset;
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

	$effect(() => {
		const currentMode = mode;
		if (wasmReady && currentMode) {
			untrack(() => compile());
		}
	});

	const monacoLanguage = $derived(
		activeTab === 'js' ? 'javascript' : activeTab === 'css' ? 'css' : 'json'
	);

	const monacoValue = $derived(
		activeTab === 'js' ? outputJs : activeTab === 'css' ? outputCss : outputAstString
	);

	const astHighlightRange = $derived<{ start: number; end: number } | null>(
		activeTab === 'ast' ? { start: cursorPosition, end: cursorPosition } : null
	);

	const inputHighlightRange = $derived<{ start: number; end: number } | null>(selectedAstRange);

	const formatBytes = (b: number): string => {
		if (b < 1024) return `${b} B`;
		return `${(b / 1024).toFixed(1)} kB`;
	};

	const tabs: { id: OutputTab; label: string; sub: string }[] = [
		{ id: 'result', label: 'Result', sub: 'iframe preview' },
		{ id: 'js', label: 'JS output', sub: 'compiled .js' },
		{ id: 'css', label: 'CSS output', sub: 'scoped styles' },
		{ id: 'ast', label: 'AST', sub: 'svelte AST · JSON' }
	];
</script>

<svelte:head>
	<title>Playground · rsvelte</title>
	<meta
		name="description"
		content="A live playground for the Rust port of the Svelte 5 compiler — edit a component and see the generated JS, CSS, AST and rendered preview."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="playground" />

	<header class="play-head">
		<div class="play-head-l">
			<p class="eyebrow"><span class="rule"></span>Live · WASM-compiled</p>
			<h1 class="title">Playground</h1>
			{#if version}
				<span class="version">v{version}</span>
			{/if}
		</div>
		<div class="play-head-r" role="radiogroup" aria-label="Compilation mode">
			<span class="mode-label">Generate</span>
			<div class="mode-switch">
				<button
					class:active={mode === 'client'}
					onclick={() => (mode = 'client')}
					disabled={!wasmReady}
				>
					Client
				</button>
				<button
					class:active={mode === 'server'}
					onclick={() => (mode = 'server')}
					disabled={!wasmReady}
				>
					Server
				</button>
			</div>
		</div>
	</header>

	<main class="workspace">
		<!-- LEFT — source editor, fills its half -->
		<section class="panel panel-input">
			<header class="panel-head">
				<span class="panel-num">01</span>
				<h2 class="panel-title">Source <em>.svelte</em></h2>
				<span class="panel-meta">debounced 300 ms</span>
			</header>
			<div class="panel-body editor-host">
				{#if wasmReady}
					<MonacoEditor
						bind:value={input}
						onchange={handleInputChange}
						onCursorPositionChange={handleCursorPositionChange}
						highlightRange={inputHighlightRange}
					/>
				{:else}
					<div class="loading">Loading editor…</div>
				{/if}
			</div>
		</section>

		<!-- RIGHT — tabbed output (Result / JS / CSS / AST) -->
		<section class="panel panel-output">
			<header class="panel-head tab-head" role="tablist" aria-label="Output tab">
				{#each tabs as t (t.id)}
					<button
						role="tab"
						class="tab"
						class:active={activeTab === t.id}
						aria-selected={activeTab === t.id}
						onclick={() => (activeTab = t.id)}
					>
						<span class="tab-label">{t.label}</span>
						<span class="tab-sub">{t.sub}</span>
					</button>
				{/each}
			</header>

			<div class="panel-body output-host">
				{#if !wasmReady && !error}
					<div class="loading">Loading WASM module…</div>
				{:else if error}
					<div class="error">
						<span class="error-tag">parse / compile error</span>
						<pre>{error}</pre>
					</div>
				{:else if activeTab === 'result'}
					<div class="preview-host">
						{#if previewHtml}
							<iframe
								srcdoc={previewHtml}
								title="Preview"
								sandbox="allow-scripts allow-popups allow-forms"
							></iframe>
						{:else}
							<div class="loading">No preview available</div>
						{/if}
					</div>
				{:else if activeTab === 'ast'}
					<div class="ast-host">
						<AstViewer
							ast={outputAst}
							highlightRange={astHighlightRange}
							onNodeClick={handleAstNodeClick}
						/>
					</div>
				{:else}
					<div class="editor-host">
						{#key `${activeTab}-${mode}-${monacoValue}`}
							<MonacoEditor value={monacoValue} language={monacoLanguage} readonly={true} />
						{/key}
					</div>
				{/if}
			</div>

			<footer class="panel-foot">
				<span>
					<span class="dim">compile</span>
					<strong>{stats.compileTime.toFixed(2)}<span class="unit">ms</span></strong>
				</span>
				<span>
					<span class="dim">js</span>
					<strong>{formatBytes(stats.outputSize)}</strong>
				</span>
				<span class="grow"></span>
				<span class="status-dot" class:ok={wasmReady && !error} class:err={!!error}></span>
				<span class="status-text">
					{#if !wasmReady}Initialising{:else if error}Error{:else}Live{/if}
				</span>
			</footer>
		</section>
	</main>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	code,
	pre {
		font-family: 'Fira Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	/* PAGE HEAD */
	.play-head {
		max-width: 1600px;
		margin: 0 auto;
		width: 100%;
		padding: clamp(1.4rem, 3vh, 2rem) clamp(1rem, 3vw, 2rem) clamp(0.8rem, 2vh, 1.2rem);
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1.2rem;
	}

	.play-head-l {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--rust);
		margin: 0;
	}

	.eyebrow .rule {
		display: inline-block;
		width: 20px;
		height: 1px;
		background: var(--rust);
	}

	.title {
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0;
	}

	.version {
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--rust);
		padding: 0.2rem 0.5rem;
		border: 1px solid currentColor;
		border-radius: 2px;
		line-height: 1;
	}

	.play-head-r {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
	}

	.mode-label {
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.mode-switch {
		display: inline-flex;
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		overflow: hidden;
		background: var(--bg);
	}

	.mode-switch button {
		font-family: 'Fira Mono', monospace;
		font-size: 0.78rem;
		padding: 0.45rem 0.95rem;
		background: transparent;
		border: 0;
		color: var(--ink-soft);
		cursor: pointer;
		border-right: 1px solid var(--rule);
		transition: background 0.18s, color 0.18s;
	}

	.mode-switch button:last-child {
		border-right: 0;
	}

	.mode-switch button:hover:not(:disabled) {
		color: var(--ink);
	}

	.mode-switch button.active {
		background: var(--ink);
		color: var(--bg);
	}

	.mode-switch button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* WORKSPACE — two equal columns, Svelte REPL style */
	.workspace {
		max-width: 1600px;
		margin: 0 auto;
		width: 100%;
		padding: 0 clamp(1rem, 3vw, 2rem) clamp(1.5rem, 4vh, 2.5rem);
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 0.85rem;
		flex: 1;
		min-height: 0;
	}

	.panel {
		display: flex;
		flex-direction: column;
		min-height: 0;
		min-width: 0;
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		overflow: hidden;
	}

	.panel-input {
		min-height: 70vh;
	}

	.panel-output {
		min-height: 70vh;
	}

	.panel-head {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.6rem 0.9rem;
		background: var(--paper);
		border-bottom: 1px solid var(--rule);
		flex-shrink: 0;
	}

	.panel-num {
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		color: var(--rust);
	}

	.panel-title {
		font-family: 'Overpass', sans-serif;
		font-weight: 700;
		font-size: 0.92rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		margin: 0;
		flex: 1;
	}

	.panel-title em {
		font-style: italic;
		color: var(--svelte);
		font-weight: 700;
	}

	.panel-meta {
		font-family: 'Fira Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
	}

	/* RIGHT-PANEL TABS — replace the title header on the output panel */
	.tab-head {
		gap: 0;
		padding: 0;
		background: var(--paper);
	}

	.tab {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.12rem;
		align-items: flex-start;
		padding: 0.6rem 0.95rem;
		background: transparent;
		border: 0;
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid transparent;
		color: var(--ink-soft);
		cursor: pointer;
		text-align: left;
		transition: background 0.18s, color 0.18s, border-color 0.18s;
	}

	.tab:last-child {
		border-right: 0;
	}

	.tab:hover {
		color: var(--ink);
		background: color-mix(in srgb, var(--paper) 60%, var(--bg));
	}

	.tab.active {
		background: var(--bg);
		color: var(--ink);
		border-bottom-color: var(--svelte);
	}

	.tab-label {
		font-family: 'Overpass', sans-serif;
		font-weight: 600;
		font-size: 0.86rem;
		letter-spacing: -0.005em;
	}

	.tab-sub {
		font-family: 'Fira Mono', monospace;
		font-size: 0.62rem;
		color: var(--ink-faint);
	}

	.tab.active .tab-sub {
		color: var(--ink-soft);
	}

	.panel-body {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.output-host {
		background: var(--editor-bg);
	}

	.editor-host {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: var(--editor-bg);
	}

	.editor-host :global(.editor-container) {
		flex: 1;
		height: 100%;
		min-height: 0;
	}

	.preview-host {
		flex: 1;
		min-height: 0;
		background: #ffffff;
	}

	.preview-host iframe {
		width: 100%;
		height: 100%;
		border: 0;
		background: #ffffff;
		display: block;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		min-height: 240px;
		padding: 2rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.82rem;
		color: var(--ink-faint);
	}

	.ast-host {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding: 0.6rem 0.8rem;
		background: var(--editor-bg);
	}

	.error {
		flex: 1;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		background: color-mix(in srgb, var(--bad) 5%, var(--bg));
		font-family: 'Fira Mono', monospace;
	}

	.error-tag {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--bad);
	}

	.error pre {
		font-size: 0.8rem;
		color: var(--ink);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}

	.panel-foot {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.55rem 0.9rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.76rem;
		color: var(--ink);
		background: var(--paper);
		border-top: 1px solid var(--rule);
		flex-shrink: 0;
	}

	.panel-foot .dim {
		color: var(--ink-faint);
		margin-right: 0.4em;
	}

	.panel-foot strong {
		font-weight: 600;
		color: var(--ink);
	}

	.unit {
		font-weight: 400;
		color: var(--ink-soft);
		margin-left: 0.15em;
	}

	.grow {
		flex: 1;
	}

	.status-dot {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: var(--ink-faint);
	}

	.status-dot.ok {
		background: var(--ok);
	}

	.status-dot.err {
		background: var(--bad);
	}

	.status-text {
		color: var(--ink-soft);
	}

	/* RESPONSIVE */
	@media (max-width: 880px) {
		.workspace {
			grid-template-columns: 1fr;
		}
		.panel-input,
		.panel-output {
			min-height: 480px;
		}
		.tab-head {
			flex-wrap: wrap;
		}
		.tab {
			flex: 1 1 50%;
			border-bottom: 1px solid var(--rule);
		}
	}
</style>
