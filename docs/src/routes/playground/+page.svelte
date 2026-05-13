<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { base } from '$app/paths';
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

	const outputLanguage = $derived(
		activeTab === 'js' ? 'javascript' : activeTab === 'css' ? 'css' : 'json'
	);

	const outputValue = $derived(
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
</script>

<svelte:head>
	<title>Playground · rsvelte</title>
	<meta
		name="description"
		content="A live playground for the Rust port of the Svelte 5 compiler — edit a component and see the generated JS, CSS, AST and rendered preview."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,200..900,0..100,0..1;1,9..144,200..900,0..100,0..1&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400..700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page">
	<div class="grain" aria-hidden="true"></div>

	<nav class="strip">
		<div class="strip-l">
			<a href="{base}/" class="mark">rsvelte</a>
			<span class="strip-sep">/</span>
			<span class="strip-here">playground</span>
			{#if version}
				<span class="strip-version mono">v{version}</span>
			{/if}
		</div>

		<div class="strip-c">
			<span class="mode-label">Generate</span>
			<div class="mode-switch" role="radiogroup" aria-label="Compilation mode">
				<button
					class:active={mode === 'client'}
					onclick={() => (mode = 'client')}
					disabled={!wasmReady}>Client</button
				>
				<button
					class:active={mode === 'server'}
					onclick={() => (mode = 'server')}
					disabled={!wasmReady}>Server</button
				>
			</div>
		</div>

		<div class="strip-r">
			<a href="{base}/progress">Compat</a>
			<a href="{base}/benchmark">Speed</a>
			<a
				href="https://github.com/baseballyama/rsvelte"
				target="_blank"
				rel="noopener"
				class="ext">GitHub <span class="chev">↗</span></a
			>
		</div>
	</nav>

	<main class="workspace">
		<!-- INPUT -->
		<section class="panel panel-input">
			<header class="panel-head">
				<span class="panel-kicker">§ 01</span>
				<h2 class="panel-title">Source <em>.svelte</em></h2>
				<span class="panel-meta mono">live · edits debounced 300ms</span>
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

		<!-- OUTPUT -->
		<section class="panel panel-output">
			<header class="panel-head">
				<span class="panel-kicker">§ 02</span>
				<h2 class="panel-title">Output</h2>
				<div class="tabs" role="tablist">
					<button
						role="tab"
						class:active={activeTab === 'js'}
						aria-selected={activeTab === 'js'}
						onclick={() => (activeTab = 'js')}>JS</button
					>
					<button
						role="tab"
						class:active={activeTab === 'css'}
						aria-selected={activeTab === 'css'}
						onclick={() => (activeTab = 'css')}>CSS</button
					>
					<button
						role="tab"
						class:active={activeTab === 'ast'}
						aria-selected={activeTab === 'ast'}
						onclick={() => (activeTab = 'ast')}>AST</button
					>
				</div>
			</header>
			<div class="panel-body editor-host">
				{#if !wasmReady && !error}
					<div class="loading">Loading WASM module…</div>
				{:else if error}
					<div class="error">
						<span class="error-tag">parse / compile error</span>
						<pre>{error}</pre>
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
					{#key `${activeTab}-${mode}-${outputValue}`}
						<MonacoEditor value={outputValue} language={outputLanguage} readonly={true} />
					{/key}
				{/if}
			</div>
			<footer class="panel-foot mono">
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

		<!-- PREVIEW -->
		<section class="panel panel-preview">
			<header class="panel-head">
				<span class="panel-kicker">§ 03</span>
				<h2 class="panel-title">Preview</h2>
				<span class="panel-meta mono">sandbox · isolated iframe</span>
			</header>
			<div class="panel-body preview-host">
				{#if !wasmReady && !error}
					<div class="loading">Loading…</div>
				{:else if error}
					<div class="loading">Preview unavailable</div>
				{:else if previewHtml}
					<iframe
						srcdoc={previewHtml}
						title="Preview"
						sandbox="allow-scripts allow-popups allow-forms"
					></iframe>
				{:else}
					<div class="loading">No preview available</div>
				{/if}
			</div>
		</section>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.page {
		--bg: #f1e8d6;
		--surface: #e6dac1;
		--ink: #1a1612;
		--ink-soft: #7a7062;
		--ink-faint: #b8ab93;
		--accent: #ff3e00;
		--accent-deep: #c52f00;
		--hairline: rgba(26, 22, 18, 0.16);
		--hairline-strong: rgba(26, 22, 18, 0.4);
		--ok: #2c7a3a;
		--err: #b1280a;

		--display: 'Fraunces', 'Source Serif Pro', Georgia, serif;
		--body: 'Instrument Sans', system-ui, -apple-system, sans-serif;
		--mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

		background: var(--bg);
		color: var(--ink);
		font-family: var(--body);
		-webkit-font-smoothing: antialiased;
		height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
		font-feature-settings: 'ss01';
	}

	.mono {
		font-family: var(--mono);
	}

	.grain {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 80;
		opacity: 0.05;
		mix-blend-mode: multiply;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
	}

	/* ============================================================
	   TOP STRIP — three-column masthead with the mode switch centered
	   ============================================================ */
	.strip {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
		padding: 0.9rem 2rem;
		background: var(--bg);
		border-bottom: 1px solid var(--hairline-strong);
		font-family: var(--mono);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		flex-shrink: 0;
		z-index: 60;
		position: relative;
	}

	.strip-l {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		min-width: 0;
	}

	.strip .mark {
		font-family: var(--display);
		font-style: italic;
		font-weight: 500;
		font-size: 1.45rem;
		letter-spacing: -0.025em;
		font-variation-settings: 'opsz' 96, 'SOFT' 80, 'WONK' 1;
		color: var(--ink);
		text-decoration: none;
		line-height: 1;
	}

	.strip-sep {
		color: var(--ink-faint);
		font-size: 1rem;
	}

	.strip-here {
		font-family: var(--body);
		font-size: 0.95rem;
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.strip-version {
		font-size: 0.66rem;
		color: var(--ink-soft);
		padding: 0.18rem 0.45rem;
		border: 1px solid var(--hairline);
		margin-left: 0.4rem;
		letter-spacing: 0.08em;
	}

	.strip-c {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		justify-self: center;
	}

	.mode-label {
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--ink-soft);
	}

	.mode-switch {
		display: inline-flex;
		border: 1px solid var(--ink);
	}

	.mode-switch button {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 0.45rem 0.95rem;
		background: transparent;
		border: 0;
		color: var(--ink);
		cursor: pointer;
		transition: background 0.2s ease, color 0.2s ease;
		border-right: 1px solid var(--ink);
	}

	.mode-switch button:last-child {
		border-right: 0;
	}

	.mode-switch button.active {
		background: var(--ink);
		color: var(--bg);
	}

	.mode-switch button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.strip-r {
		display: flex;
		gap: 1.4rem;
		align-items: center;
		justify-self: end;
	}

	.strip-r a {
		text-decoration: none;
		color: var(--ink);
		text-transform: uppercase;
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		padding-bottom: 2px;
		border-bottom: 1px solid transparent;
		transition: border-color 0.25s ease, color 0.25s ease;
	}

	.strip-r a:hover {
		border-bottom-color: var(--accent);
		color: var(--accent);
	}

	.strip-r .chev {
		font-family: var(--mono);
	}

	/* ============================================================
	   WORKSPACE GRID
	   ============================================================ */
	.workspace {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		min-height: 0;
		min-width: 0;
		background: var(--bg);
	}

	.panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		border-right: 1px solid var(--hairline-strong);
		background: var(--bg);
	}

	.panel:last-child {
		border-right: 0;
	}

	.panel-input {
		background: var(--surface);
	}

	.panel-output {
		background: var(--bg);
	}

	.panel-preview {
		background: var(--surface);
	}

	.panel-head {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.85rem 1.25rem;
		border-bottom: 1px solid var(--hairline-strong);
		background: inherit;
	}

	.panel-kicker {
		font-family: var(--mono);
		font-size: 0.66rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent);
		flex-shrink: 0;
	}

	.panel-title {
		font-family: var(--display);
		font-weight: 400;
		font-size: 1.35rem;
		line-height: 1;
		letter-spacing: -0.02em;
		margin: 0;
		flex-shrink: 0;
	}

	.panel-title em {
		font-style: italic;
		color: var(--accent);
		font-variation-settings: 'opsz' 96, 'SOFT' 100, 'WONK' 1;
		font-weight: 400;
		font-family: var(--display);
		padding-right: 0.02em;
	}

	.panel-meta {
		font-size: 0.66rem;
		color: var(--ink-soft);
		text-transform: lowercase;
		letter-spacing: 0.08em;
		margin-left: auto;
		text-align: right;
	}

	.tabs {
		display: inline-flex;
		margin-left: auto;
		border: 1px solid var(--hairline-strong);
	}

	.tabs button {
		font-family: var(--mono);
		font-size: 0.7rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 0.42rem 0.85rem;
		background: transparent;
		border: 0;
		color: var(--ink-soft);
		cursor: pointer;
		transition: background 0.2s ease, color 0.2s ease;
		border-right: 1px solid var(--hairline-strong);
	}

	.tabs button:last-child {
		border-right: 0;
	}

	.tabs button:hover {
		color: var(--ink);
	}

	.tabs button.active {
		background: var(--ink);
		color: var(--bg);
	}

	.panel-body {
		flex: 1;
		min-height: 0;
		position: relative;
		overflow: hidden;
		background: var(--bg);
	}

	.editor-host {
		background: var(--bg);
	}

	.preview-host {
		background: #ffffff;
	}

	.preview-host iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}

	.ast-host {
		position: absolute;
		inset: 0;
		overflow: auto;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--ink-soft);
		font-family: var(--mono);
		font-size: 0.78rem;
		letter-spacing: 0.08em;
	}

	.error {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.5rem;
		font-family: var(--mono);
		font-size: 0.82rem;
		color: var(--err);
		max-height: 100%;
		overflow: auto;
	}

	.error-tag {
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--err);
		opacity: 0.75;
	}

	.error pre {
		margin: 0;
		padding: 1rem;
		background: rgba(177, 40, 10, 0.06);
		border-left: 3px solid var(--err);
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.55;
	}

	.panel-foot {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.7rem 1.25rem;
		border-top: 1px solid var(--hairline-strong);
		background: inherit;
		font-size: 0.72rem;
		color: var(--ink-soft);
	}

	.panel-foot strong {
		color: var(--ink);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.panel-foot .unit {
		color: var(--ink-soft);
		font-weight: 400;
		margin-left: 0.1em;
	}

	.panel-foot .dim {
		color: var(--ink-soft);
		margin-right: 0.4em;
		text-transform: uppercase;
		font-size: 0.62rem;
		letter-spacing: 0.16em;
	}

	.panel-foot .grow {
		flex: 1;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: var(--ink-faint);
		display: inline-block;
	}

	.status-dot.ok {
		background: var(--ok);
		box-shadow: 0 0 0 3px rgba(44, 122, 58, 0.18);
	}

	.status-dot.err {
		background: var(--err);
		box-shadow: 0 0 0 3px rgba(177, 40, 10, 0.18);
	}

	.status-text {
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.62rem;
		color: var(--ink);
	}

	/* AstViewer reads the page's CSS variables and themes itself; we only
	   provide the scroll container here. */

	@media (max-width: 1100px) {
		.workspace {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
		}
		.panel-preview {
			grid-column: 1 / -1;
			border-right: 0;
			border-top: 1px solid var(--hairline-strong);
		}
	}

	@media (max-width: 720px) {
		.workspace {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr 1fr 1fr;
		}
		.panel {
			border-right: 0;
			border-bottom: 1px solid var(--hairline-strong);
		}
		.strip {
			grid-template-columns: 1fr;
			gap: 0.5rem;
			padding: 0.7rem 1rem;
		}
		.strip-c,
		.strip-r {
			justify-self: stretch;
			justify-content: space-between;
		}
		.strip-r {
			gap: 1rem;
		}
		.strip-r a {
			font-size: 0.62rem;
			letter-spacing: 0.12em;
		}
		.panel-head {
			padding: 0.65rem 1rem;
			gap: 0.5rem;
		}
		.panel-title {
			font-size: 1.1rem;
		}
		.panel-meta {
			display: none;
		}
	}
</style>
