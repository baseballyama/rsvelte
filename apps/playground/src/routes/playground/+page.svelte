<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import {
		initCompiler,
		getVersion,
		parse,
		compileClient,
		compileServer,
		lint,
		svelte2tsx,
		type CompileMode,
		type OutputTab,
		type CompileStats,
		type LintDiagnostic
	} from '$lib/compiler';
	import { initFmt, formatSvelte, getFmtVersion } from '$lib/fmt';
	import { generatePreviewHtml } from '$lib/preview';
	import { encodeCode, readSharedCode } from '$lib/share';
	import { DEFAULT_EXAMPLE } from '$lib/examples';
	import { TOOLS, toolById, isToolId, type ToolId } from '$lib/tools';
	import MonacoEditor from '$lib/monaco/MonacoEditor.svelte';
	import AstViewer from '$lib/components/AstViewer.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let tool = $state<ToolId>('compiler');
	let input = $state(DEFAULT_EXAMPLE);

	let mode: CompileMode = $state('client');
	let activeTab: OutputTab = $state('result');
	let wasmReady = $state(false);
	let version = $state('');
	let error = $state('');

	// ── compiler outputs ──────────────────────────────
	let outputJs = $state('');
	let outputCss = $state('');
	let outputAst = $state<object | null>(null);
	let outputAstString = $state('');
	let previewHtml = $state('');
	let lintDiagnostics = $state<LintDiagnostic[]>([]);
	let stats: CompileStats = $state({ compileTime: 0, outputSize: 0 });
	let cursorPosition = $state(0);
	let selectedAstRange = $state<{ start: number; end: number } | null>(null);

	// ── svelte2tsx outputs ────────────────────────────
	let tsxMode = $state<'ts' | 'dts'>('ts');
	let tsxOutput = $state('');
	let tsxNames = $state<string[]>([]);
	let tsxError = $state('');

	// ── fmt outputs ───────────────────────────────────
	let fmtReady = $state(false);
	let fmtVersion = $state('');
	let fmtOutput = $state('');
	let fmtError = $state('');
	let fmtChanged = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout>;

	// ── share ─────────────────────────────────────────
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;

	const currentTool = $derived(toolById(tool)!);

	// Reflect the current tool + editor contents into the URL so the page can be
	// shared by copying the link. The source rides in the hash (`#code=…`) to
	// keep it off the server and free of length limits; the tool stays a query
	// param for backwards-compatible deep links.
	function syncUrl() {
		try {
			const url = new URL(page.url);
			url.searchParams.set('tool', tool);
			url.hash = input ? `code=${encodeCode(input)}` : '';
			replaceState(url, page.state);
		} catch {
			// replaceState can throw if the router isn't ready yet — the in-memory
			// state still drives the UI, so URL sync is best-effort.
		}
	}

	async function copyShareLink() {
		syncUrl();
		try {
			await navigator.clipboard.writeText(location.href);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard can be blocked (insecure context / permissions); the URL
			// in the address bar is already up to date, so this is non-fatal.
		}
	}

	// ── compiler ──────────────────────────────────────
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

	// ── svelte2tsx ────────────────────────────────────
	function runSvelte2tsx() {
		if (!wasmReady) return;
		tsxError = '';
		try {
			const res = svelte2tsx(input, {
				filename: 'Component.svelte',
				isTsFile: true,
				mode: tsxMode
			});
			if (!res.success) {
				tsxError = res.error || 'svelte2tsx failed';
				tsxOutput = '';
				tsxNames = [];
				return;
			}
			tsxOutput = res.code || '';
			tsxNames = res.exportedNames?.props ?? [];
		} catch (e) {
			tsxError = e instanceof Error ? e.message : String(e);
			tsxOutput = '';
			tsxNames = [];
		}
	}

	// ── fmt ───────────────────────────────────────────
	async function ensureFmt() {
		if (fmtReady) return;
		await initFmt();
		fmtReady = true;
		fmtVersion = getFmtVersion();
	}

	function runFmt() {
		if (!fmtReady) return;
		fmtError = '';
		try {
			const res = formatSvelte(input, {});
			if (!res.success) {
				fmtError = res.error || 'Formatting failed';
				fmtOutput = '';
				return;
			}
			fmtOutput = res.code ?? '';
			fmtChanged = fmtOutput !== input;
		} catch (e) {
			fmtError = e instanceof Error ? e.message : String(e);
			fmtOutput = '';
		}
	}

	// ── lint ──────────────────────────────────────────
	function runLint() {
		if (!wasmReady) return;
		// Surfaces compiler warnings/errors + a11y + the native rsvelte-lint rules.
		lintDiagnostics = lint(input, 'Component.svelte');
	}

	function run() {
		if (tool === 'compiler') compile();
		else if (tool === 'svelte2tsx') runSvelte2tsx();
		else if (tool === 'fmt') runFmt();
		else if (tool === 'lint') runLint();
	}

	async function selectTool(next: ToolId) {
		if (next === tool) return;
		tool = next;
		syncUrl();
		if (next === 'fmt') await ensureFmt();
		run();
	}

	function applyFormatted() {
		if (fmtOutput) {
			input = fmtOutput;
			fmtChanged = false;
			syncUrl();
		}
	}

	function handleInputChange() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			run();
			syncUrl();
		}, 300);
	}

	function handleCursorPositionChange(offset: number) {
		cursorPosition = offset;
		selectedAstRange = null;
	}

	function handleAstNodeClick(start: number, end: number) {
		selectedAstRange = { start, end };
	}

	onMount(async () => {
		const t = page.url.searchParams.get('tool');
		if (t && isToolId(t)) tool = t;
		const shared = readSharedCode(page.url.hash);
		if (shared !== null) input = shared;
		try {
			await initCompiler();
			wasmReady = true;
			version = getVersion();
			if (tool === 'fmt') await ensureFmt();
			run();
		} catch (e) {
			error = `Failed to load WASM: ${e instanceof Error ? e.message : String(e)}`;
		}
	});

	// Re-run the active tool when its inputs (tool, mode, tsxMode) change, or
	// once the relevant WASM module finishes loading.
	$effect(() => {
		void [tool, mode, tsxMode, fmtReady, wasmReady];
		if (wasmReady) untrack(() => run());
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

	const lintCount = $derived(lintDiagnostics.length);

	const tabs = $derived<{ id: OutputTab; label: string; sub: string }[]>([
		{ id: 'result', label: 'Result', sub: 'iframe preview' },
		{ id: 'js', label: 'JS output', sub: 'compiled .js' },
		{ id: 'css', label: 'CSS output', sub: 'scoped styles' },
		{ id: 'ast', label: 'AST', sub: 'svelte AST · JSON' }
	]);

	const cliFor = (id: ToolId): { lang: string; code: string } => {
		if (id === 'svelte-check') {
			return { lang: 'bash', code: 'npm i -D @rsvelte/svelte-check\nrsvelte-check --watch' };
		}
		return {
			lang: 'js',
			code: `import { svelte } from '@rsvelte/vite-plugin-svelte';\n\nexport default { plugins: [svelte()] };`
		};
	};
</script>

<svelte:head>
	<title>Playground · rsvelte</title>
	<meta
		name="description"
		content="A live playground for rsvelte, the Rust port of the Svelte ecosystem — run the compiler, svelte2tsx and formatter on WebAssembly, right in the browser."
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

		<div class="head-r">
			<div class="tool-switch" role="tablist" aria-label="Tool">
				{#each TOOLS as t (t.id)}
					<button
						role="tab"
						aria-selected={tool === t.id}
						class:active={tool === t.id}
						class:muted={!t.runnable}
						title={t.tagline}
						onclick={() => selectTool(t.id)}
					>
						{t.label}
						{#if !t.runnable}<span class="cli-dot" aria-hidden="true">CLI</span>{/if}
					</button>
				{/each}
			</div>

			{#if currentTool.runnable}
				<button
					class="share"
					class:copied
					onclick={copyShareLink}
					title="Copy a link to this code"
				>
					{copied ? 'Link copied' : 'Share'}
				</button>
			{/if}
		</div>
	</header>

	{#if currentTool.runnable}
		<main class="workspace">
			<!-- LEFT — source editor -->
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

			<!-- RIGHT — output, depends on the active tool -->
			<section class="panel panel-output">
				{#if tool === 'compiler'}
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
						<div class="head-aside" role="radiogroup" aria-label="Compilation mode">
							<button class:active={mode === 'client'} onclick={() => (mode = 'client')}>
								Client
							</button>
							<button class:active={mode === 'server'} onclick={() => (mode = 'server')}>
								Server
							</button>
						</div>
					</header>
				{:else if tool === 'svelte2tsx'}
					<header class="panel-head">
						<span class="panel-num">02</span>
						<h2 class="panel-title">TSX <em>shadow</em></h2>
						<div class="head-aside">
							<button class:active={tsxMode === 'ts'} onclick={() => (tsxMode = 'ts')}>ts</button>
							<button class:active={tsxMode === 'dts'} onclick={() => (tsxMode = 'dts')}>
								d.ts
							</button>
						</div>
					</header>
				{:else if tool === 'fmt'}
					<header class="panel-head">
						<span class="panel-num">02</span>
						<h2 class="panel-title">Formatted <em>output</em></h2>
						<button class="apply" disabled={!fmtChanged} onclick={applyFormatted}>
							Apply to source
						</button>
					</header>
				{:else if tool === 'lint'}
					<header class="panel-head">
						<span class="panel-num">02</span>
						<h2 class="panel-title">Lint <em>diagnostics</em></h2>
						<span class="panel-meta">{lintCount === 1 ? '1 finding' : `${lintCount} findings`}</span>
					</header>
				{/if}

				<div class="panel-body output-host">
					{#if !wasmReady && !error}
						<div class="loading">Loading WASM module…</div>
					{:else if tool === 'compiler'}
						{#if error}
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
					{:else if tool === 'svelte2tsx'}
						{#if tsxError}
							<div class="error">
								<span class="error-tag">svelte2tsx error</span>
								<pre>{tsxError}</pre>
							</div>
						{:else}
							<div class="tsx-host">
								<div class="names">
									<span class="names-label">exported props</span>
									{#if tsxNames.length}
										{#each tsxNames as n (n)}
											<code class="chip">{n}</code>
										{/each}
									{:else}
										<span class="names-empty">none</span>
									{/if}
								</div>
								<div class="editor-host">
									{#key `tsx-${tsxMode}-${tsxOutput}`}
										<MonacoEditor value={tsxOutput} language="typescript" readonly={true} />
									{/key}
								</div>
							</div>
						{/if}
					{:else if tool === 'fmt'}
						{#if fmtError}
							<div class="error">
								<span class="error-tag">format error</span>
								<pre>{fmtError}</pre>
							</div>
						{:else if !fmtReady}
							<div class="loading">Loading formatter…</div>
						{:else}
							<div class="editor-host">
								{#key `fmt-${fmtOutput}`}
									<MonacoEditor value={fmtOutput} language="html" readonly={true} />
								{/key}
							</div>
						{/if}
					{:else if tool === 'lint'}
						<div class="lint-host">
							{#if lintDiagnostics.length === 0}
								<div class="lint-empty">No lint findings — looks clean.</div>
							{:else}
								<ul class="lint-list">
									{#each lintDiagnostics as d (d.line + ':' + d.column + ':' + d.code)}
										<li class="lint-item">
											<span class="lint-sev lint-{d.severity}">{d.severity}</span>
											<span class="lint-loc" title="line {d.line}, column {d.column}">
												{d.line}:{d.column}
											</span>
											<span class="lint-msg">{d.message}</span>
											<span class="lint-code">{d.code}</span>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>

				<footer class="panel-foot">
					{#if tool === 'compiler'}
						<span>
							<span class="dim">compile</span>
							<strong>{stats.compileTime.toFixed(2)}<span class="unit">ms</span></strong>
						</span>
						<span>
							<span class="dim">js</span>
							<strong>{formatBytes(stats.outputSize)}</strong>
						</span>
					{:else if tool === 'svelte2tsx'}
						<span><span class="dim">props</span> <strong>{tsxNames.length}</strong></span>
					{:else if tool === 'fmt'}
						<span>
							<span class="dim">status</span>
							<strong>{fmtChanged ? 'reformatted' : 'already formatted'}</strong>
						</span>
						{#if fmtVersion}
							<span><span class="dim">format</span> <strong>v{fmtVersion}</strong></span>
						{/if}
						<span class="note">&lt;style&gt; left verbatim in-browser</span>
					{:else if tool === 'lint'}
						<span><span class="dim">findings</span> <strong>{lintCount}</strong></span>
					{/if}
					<span class="grow"></span>
					<span class="status-dot" class:ok={wasmReady && !error} class:err={!!error}></span>
					<span class="status-text">
						{#if !wasmReady}Initialising{:else if error}Error{:else}Live{/if}
					</span>
				</footer>
			</section>
		</main>
	{:else}
		<!-- Non-runnable tools: explain why and link the guide + CLI -->
		<main class="explainer">
			<div class="explain-card">
				<p class="eyebrow"><span class="rule"></span>{currentTool.pkg}</p>
				<h2 class="explain-title">{currentTool.label} can't run in a browser</h2>
				<p class="explain-body">{currentTool.cantRunReason}</p>
				<div class="explain-actions">
					<a class="btn primary" href="{base}/docs/{currentTool.id}">Read the guide →</a>
				</div>
				<div class="explain-code">
					<CodeBlock code={cliFor(currentTool.id).code} lang={cliFor(currentTool.id).lang} />
				</div>
			</div>
		</main>
	{/if}
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	code,
	pre {
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	/* PAGE HEAD */
	.play-head {
		max-width: 100%;
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
		font-family: 'JetBrains Mono', monospace;
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
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 800;
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0;
	}

	.version {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.74rem;
		color: var(--rust);
		padding: 0.2rem 0.5rem;
		border: 1px solid currentColor;
		border-radius: 2px;
		line-height: 1;
	}

	.head-r {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	/* SHARE */
	.share {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.76rem;
		padding: 0.45rem 0.85rem;
		border: 1px solid var(--rule-strong);
		border-radius: 6px;
		background: var(--paper);
		color: var(--ink-soft);
		cursor: pointer;
		white-space: nowrap;
		transition:
			background 0.16s,
			color 0.16s,
			border-color 0.16s;
	}

	.share:hover {
		color: var(--ink);
		border-color: var(--ink);
	}

	.share.copied {
		color: var(--ok);
		border-color: var(--ok);
	}

	/* TOOL SWITCHER */
	.tool-switch {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		padding: 0.25rem;
		border: 1px solid var(--rule-strong);
		border-radius: 6px;
		background: var(--paper);
	}

	.tool-switch button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.76rem;
		padding: 0.4rem 0.7rem;
		background: transparent;
		border: 0;
		border-radius: 4px;
		color: var(--ink-soft);
		cursor: pointer;
		transition:
			background 0.16s,
			color 0.16s;
	}

	.tool-switch button:hover {
		color: var(--ink);
	}

	.tool-switch button.active {
		background: var(--bg);
		color: var(--ink);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
	}

	.tool-switch button.active.muted {
		color: var(--ink-soft);
	}

	.cli-dot {
		font-size: 0.56rem;
		letter-spacing: 0.06em;
		color: var(--ink-faint);
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		padding: 0.05rem 0.3rem;
	}

	/* WORKSPACE — two equal columns, full width */
	.workspace {
		max-width: 100%;
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

	.panel-input,
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
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		color: var(--rust);
	}

	.panel-title {
		font-family: 'Hanken Grotesk', sans-serif;
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
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
	}

	/* small inline button groups in panel heads (mode / ts-dts) */
	.head-aside {
		display: inline-flex;
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		overflow: hidden;
		background: var(--bg);
		flex-shrink: 0;
	}

	.head-aside button {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		padding: 0.35rem 0.7rem;
		background: transparent;
		border: 0;
		border-right: 1px solid var(--rule);
		color: var(--ink-soft);
		cursor: pointer;
		transition:
			background 0.16s,
			color 0.16s;
	}

	.head-aside button:last-child {
		border-right: 0;
	}

	.head-aside button:hover {
		color: var(--ink);
	}

	.head-aside button.active {
		background: var(--ink);
		color: var(--bg);
	}

	.apply {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		background: var(--bg);
		color: var(--ink-soft);
		cursor: pointer;
		flex-shrink: 0;
	}

	.apply:hover:not(:disabled) {
		color: var(--ink);
		border-color: var(--ink);
	}

	.apply:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* RIGHT-PANEL TABS */
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
		transition:
			background 0.18s,
			color 0.18s,
			border-color 0.18s;
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
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 600;
		font-size: 0.86rem;
		letter-spacing: -0.005em;
	}

	.tab-sub {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		color: var(--ink-faint);
	}

	.tab.active .tab-sub {
		color: var(--ink-soft);
	}

	.tab-head .head-aside {
		margin: 0 0.5rem;
		align-self: center;
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
		font-family: 'JetBrains Mono', monospace;
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

	.lint-host {
		flex: 1;
		min-height: 0;
		overflow: auto;
		background: var(--editor-bg);
		font-family: 'Fira Mono', monospace;
		font-size: 0.82rem;
	}

	.lint-empty {
		padding: 1.2rem;
		opacity: 0.7;
	}

	.lint-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.lint-item {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.4rem 0.8rem;
		border-bottom: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
	}

	.lint-sev {
		flex: none;
		text-transform: uppercase;
		font-size: 0.62rem;
		letter-spacing: 0.04em;
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
	}

	.lint-error {
		color: var(--bad);
		background: color-mix(in srgb, var(--bad) 14%, transparent);
	}

	.lint-warning {
		color: var(--warn);
		background: color-mix(in srgb, var(--warn) 14%, transparent);
	}

	.lint-loc {
		flex: none;
		color: var(--ink-soft);
		opacity: 0.75;
		min-width: 3.2rem;
	}

	.lint-msg {
		flex: 1;
	}

	.lint-code {
		flex: none;
		opacity: 0.55;
		font-size: 0.74rem;
	}

	/* svelte2tsx exported-names strip */
	.tsx-host {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.names {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.7rem;
		border-bottom: 1px solid var(--rule);
		background: var(--paper);
	}

	.names-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.64rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-right: 0.3rem;
	}

	.names-empty {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}

	.chip {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink);
		background: var(--paper-2);
		border: 1px solid var(--rule);
		border-radius: 3px;
		padding: 0.1rem 0.4rem;
	}

	.error {
		flex: 1;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		background: color-mix(in srgb, var(--bad) 5%, var(--bg));
		font-family: 'JetBrains Mono', monospace;
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
		font-family: 'JetBrains Mono', monospace;
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

	.panel-foot .note {
		color: var(--ink-faint);
		font-size: 0.7rem;
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

	/* NON-RUNNABLE TOOL EXPLAINER */
	.explainer {
		flex: 1;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: clamp(1.5rem, 5vh, 3.5rem) clamp(1rem, 4vw, 2rem) 3rem;
	}

	.explain-card {
		width: 100%;
		max-width: 40rem;
		border: 1px solid var(--rule);
		border-radius: 10px;
		background: var(--bg);
		padding: clamp(1.4rem, 3vw, 2.2rem);
	}

	.explain-title {
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 800;
		font-size: clamp(1.3rem, 3vw, 1.7rem);
		letter-spacing: -0.02em;
		color: var(--ink);
		margin: 0.5rem 0 0.7rem;
	}

	.explain-body {
		font-size: 0.96rem;
		line-height: 1.7;
		color: var(--ink-soft);
		margin: 0 0 1.3rem;
	}

	.explain-actions {
		margin-bottom: 1.2rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		font-size: 0.88rem;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: 5px;
	}

	.btn.primary {
		background: var(--svelte);
		color: #fff;
	}

	.btn.primary:hover {
		background: var(--svelte-hover);
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
