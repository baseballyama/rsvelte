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
	import { generateProjectPreviewHtml } from '$lib/preview';
	import {
		encodeCode,
		encodeProject,
		readSharedCode,
		readSharedProject
	} from '$lib/share';
	import { DEFAULT_EXAMPLE } from '$lib/examples';
	import { TOOLS, toolById, isToolId, type ToolId } from '$lib/tools';
	import MonacoEditor from '$lib/monaco/MonacoEditor.svelte';
	import AstViewer from '$lib/components/AstViewer.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	interface PlaygroundFile {
		id: number;
		name: string;
		code: string;
	}

	let tool = $state<ToolId>('compiler');
	let nextFileId = 2;
	let files = $state<PlaygroundFile[]>([{ id: 1, name: 'App.svelte', code: DEFAULT_EXAMPLE }]);
	let activeFileId = $state(1);

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

	const runnableTools = TOOLS.filter((entry) => entry.runnable);
	const activeFile = $derived(files.find((file) => file.id === activeFileId) ?? files[0]);
	const input = $derived(activeFile?.code ?? '');

	// Reflect the current tool + editor contents into the URL so the page can be
	// shared by copying the link. The source rides in the hash (`#code=…`) to
	// keep it off the server and free of length limits; the tool stays a query
	// param for backwards-compatible deep links.
	function syncUrl() {
		try {
			const url = new URL(page.url);
			url.searchParams.set('tool', tool);
			url.hash =
				files.length === 1 && files[0].name === 'App.svelte'
					? `code=${encodeCode(files[0].code)}`
					: `project=${encodeProject(files.map(({ name, code }) => ({ name, code })))}`;
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
			const componentName = activeFile.name
				.replace(/^.*\//, '')
				.replace(/\.svelte$/, '')
				.replace(/[^A-Za-z0-9_$]/g, '_');
			const clientResult = compileClient(input, componentName);
			const result = mode === 'client' ? clientResult : compileServer(input, componentName);
			const endTime = performance.now();

			if (!result.success) {
				error = result.error || 'Compilation failed';
				previewHtml = '';
				return;
			}

			outputJs = result.js;
			outputCss = result.css || '/* No CSS */';

			const previewModules = [];
			for (const file of files) {
				const fileResult =
					file.id === activeFile.id
						? clientResult
						: compileClient(
								file.code,
								file.name
									.replace(/^.*\//, '')
									.replace(/\.svelte$/, '')
									.replace(/[^A-Za-z0-9_$]/g, '_')
							);
				if (!fileResult.success) {
					throw new Error(`${file.name}: ${fileResult.error || 'Compilation failed'}`);
				}
				previewModules.push({
					filename: file.name,
					js: fileResult.js,
					css: fileResult.css || ''
				});
			}
			previewHtml = generateProjectPreviewHtml(activeFile.name, previewModules);

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
				filename: activeFile.name,
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
		lintDiagnostics = lint(input, activeFile.name);
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
			activeFile.code = fmtOutput;
			fmtChanged = false;
			syncUrl();
		}
	}

	function handleInputChange(code: string) {
		activeFile.code = code;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			run();
			syncUrl();
		}, 300);
	}

	function selectFile(id: number) {
		if (id === activeFileId) return;
		activeFileId = id;
		selectedAstRange = null;
		cursorPosition = 0;
		run();
	}

	function validateFilename(value: string): string | null {
		const name = value.trim().replace(/^\/+/, '');
		if (!name || name.includes('..') || !/^[\w./-]+\.svelte$/.test(name)) return null;
		return name;
	}

	function addFile() {
		let index = files.length + 1;
		while (files.some((file) => file.name === `Component${index}.svelte`)) index += 1;
		const entered = window.prompt('New component filename', `Component${index}.svelte`);
		if (entered === null) return;
		const name = validateFilename(entered);
		if (!name || files.some((file) => file.name === name)) {
			window.alert('Use a unique .svelte filename without “..”.');
			return;
		}
		const file = {
			id: nextFileId++,
			name,
			code: '<script>\n\t// New component\n<' + '/script>\n\n<h2>New component</h2>\n'
		};
		files.push(file);
		activeFileId = file.id;
		run();
		syncUrl();
	}

	function renameFile(file: PlaygroundFile) {
		const entered = window.prompt('Rename component', file.name);
		if (entered === null || entered === file.name) return;
		const name = validateFilename(entered);
		if (!name || files.some((candidate) => candidate.id !== file.id && candidate.name === name)) {
			window.alert('Use a unique .svelte filename without “..”.');
			return;
		}
		file.name = name;
		run();
		syncUrl();
	}

	function removeFile(file: PlaygroundFile) {
		if (files.length === 1) return;
		if (!window.confirm(`Delete ${file.name}?`)) return;
		const index = files.findIndex((candidate) => candidate.id === file.id);
		files.splice(index, 1);
		if (activeFileId === file.id) activeFileId = files[Math.max(0, index - 1)].id;
		run();
		syncUrl();
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
		if (t && isToolId(t) && toolById(t)?.runnable) tool = t;
		const sharedProject = readSharedProject(page.url.hash);
		if (sharedProject) {
			files = sharedProject.map((file) => ({ ...file, id: nextFileId++ }));
			activeFileId = files[0].id;
		} else {
			const shared = readSharedCode(page.url.hash);
			if (shared !== null) files[0].code = shared;
		}
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

	const tabs = $derived<{ id: OutputTab; label: string }[]>([
		{ id: 'result', label: 'Result' },
		{ id: 'js', label: 'JavaScript' },
		{ id: 'css', label: 'CSS' },
		{ id: 'ast', label: 'AST' }
	]);

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
		<div class="play-summary">
			<nav class="breadcrumbs" aria-label="Breadcrumb">
				<a href="{base}/">Documentation</a><span>/</span><span>Playground</span>
			</nav>
			<h1 class="title">Playground</h1>
			<p class="play-description">
				Edit a Svelte project and inspect the generated output.{#if version}
					<span class="version">rsvelte {version}</span>{/if}
			</p>
		</div>

		<button
			class="share"
			class:copied
			onclick={copyShareLink}
			title="Copy a link to this project"
		>
			{copied ? 'Link copied' : 'Share'}
		</button>
	</header>

	<main class="workspace">
			<section class="panel panel-input">
				<header class="panel-head file-head">
					<div class="file-tabs" role="tablist" aria-label="Project files">
						{#each files as file (file.id)}
							<div class="file-tab" class:active={file.id === activeFileId}>
								<button
									class="file-select"
									role="tab"
									aria-selected={file.id === activeFileId}
									onclick={() => selectFile(file.id)}
									ondblclick={() => renameFile(file)}
									title="Double-click to rename"
								>
									{file.name}
								</button>
								{#if files.length > 1}
									<button
										class="file-close"
										aria-label={`Delete ${file.name}`}
										onclick={(event) => {
											event.stopPropagation();
											removeFile(file);
										}}
									>×</button>
								{/if}
							</div>
						{/each}
					</div>
					<button class="file-add" onclick={addFile} title="Add component" aria-label="Add component">
						+
					</button>
				</header>
				<div class="panel-body editor-host">
					{#if wasmReady}
						<MonacoEditor
							value={input}
							onchange={handleInputChange}
							onCursorPositionChange={handleCursorPositionChange}
							highlightRange={inputHighlightRange}
						/>
					{:else}
						<div class="loading">Loading editor…</div>
					{/if}
				</div>
			</section>

			<section class="panel panel-output">
				<div class="tool-switch" role="tablist" aria-label="Tool">
					{#each runnableTools as t (t.id)}
						<button
							role="tab"
							aria-selected={tool === t.id}
							class:active={tool === t.id}
							title={t.tagline}
							onclick={() => selectTool(t.id)}
						>
							{t.label}
						</button>
					{/each}
				</div>

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
								{t.label}
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
						<h2 class="panel-title">TSX output</h2>
						<div class="head-aside">
							<button class:active={tsxMode === 'ts'} onclick={() => (tsxMode = 'ts')}>ts</button>
							<button class:active={tsxMode === 'dts'} onclick={() => (tsxMode = 'dts')}>
								d.ts
							</button>
						</div>
					</header>
				{:else if tool === 'fmt'}
					<header class="panel-head">
						<h2 class="panel-title">Formatted source</h2>
						<button class="apply" disabled={!fmtChanged} onclick={applyFormatted}>
							Apply to source
						</button>
					</header>
				{:else if tool === 'lint'}
					<header class="panel-head">
						<h2 class="panel-title">Lint diagnostics</h2>
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
						<span>Compile: {stats.compileTime.toFixed(2)} ms</span>
						<span>Output: {formatBytes(stats.outputSize)}</span>
					{:else if tool === 'svelte2tsx'}
						<span>{tsxNames.length} exported {tsxNames.length === 1 ? 'prop' : 'props'}</span>
					{:else if tool === 'fmt'}
						<span>{fmtChanged ? 'Formatting changes available' : 'Source is formatted'}</span>
						{#if fmtVersion}
							<span>Formatter {fmtVersion}</span>
						{/if}
					{:else if tool === 'lint'}
						<span>{lintCount} {lintCount === 1 ? 'finding' : 'findings'}</span>
					{/if}
					<span class="grow"></span>
					<span>{#if !wasmReady}Loading{:else if error}Error{:else}Ready{/if}</span>
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
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	.play-head {
		max-width: none;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
		padding: 2.25rem clamp(0.75rem, 1.5vw, 1.5rem) 1rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
		gap: 1rem 2rem;
	}

	.title {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: clamp(2rem, 4vw, 2.75rem);
		line-height: 1.15;
		letter-spacing: -0.035em;
		color: var(--ink);
		margin: 0;
	}

	.play-description {
		max-width: 68ch;
		margin: 0.7rem 0 0;
		font-size: 1rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}

	.breadcrumbs {
		display: flex;
		gap: 0.45rem;
		align-items: center;
		margin-bottom: 1.4rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}

	.breadcrumbs a {
		color: var(--ink-soft);
		text-decoration: none;
	}

	.breadcrumbs a:hover {
		color: var(--accent);
		text-decoration: underline;
	}

	.version {
		margin-left: 0.55rem;
		font-family: var(--font-code);
		font-size: 0.72rem;
		color: var(--ink-faint);
	}

	.share {
		grid-column: 2;
		grid-row: 1;
		font-family: var(--font-ui);
		font-size: 0.78rem;
		padding: 0.42rem 0.8rem;
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		background: var(--bg);
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

	.tool-switch {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0;
		width: 100%;
		background: var(--paper);
		border-bottom: 1px solid var(--rule);
		flex-shrink: 0;
	}

	.tool-switch button {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 500;
		padding: 0.45rem 0.7rem;
		background: transparent;
		border: 0;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		color: var(--ink-soft);
		cursor: pointer;
		text-align: center;
		white-space: nowrap;
	}

	.tool-switch button:hover {
		color: var(--ink);
	}

	.tool-switch button.active {
		color: var(--ink);
		border-bottom-color: var(--accent);
	}

	.workspace {
		max-width: none;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
		padding: 0 clamp(0.75rem, 1.5vw, 1.5rem) clamp(1.5rem, 4vh, 2.5rem);
		display: grid;
		grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
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
		border-radius: 4px;
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

	.panel-title {
		font-family: var(--font-ui);
		font-weight: 650;
		font-size: 0.92rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		margin: 0;
		flex: 1;
	}

	.file-head {
		gap: 0;
		padding: 0;
		overflow: hidden;
	}

	.file-tabs {
		min-width: 0;
		flex: 1;
		display: flex;
		overflow-x: auto;
		scrollbar-width: thin;
	}

	.file-tab {
		display: flex;
		align-items: center;
		flex: none;
		border-right: 1px solid var(--rule);
		border-bottom: 2px solid transparent;
		background: var(--paper);
	}

	.file-tab.active {
		background: var(--editor-bg);
		border-bottom-color: var(--accent);
	}

	.file-select,
	.file-close,
	.file-add {
		font-family: var(--font-ui);
		color: var(--ink-soft);
		background: transparent;
		border: 0;
		cursor: pointer;
	}

	.file-select {
		padding: 0.68rem 0.25rem 0.62rem 0.9rem;
		font-size: 0.8rem;
	}

	.file-tab.active .file-select {
		color: var(--ink);
		font-weight: 600;
	}

	.file-close {
		padding: 0.62rem 0.55rem 0.62rem 0.35rem;
		font-size: 1rem;
	}

	.file-close:hover,
	.file-add:hover {
		color: var(--accent);
	}

	.file-add {
		align-self: stretch;
		padding: 0 0.9rem;
		font-size: 1.1rem;
		border-left: 1px solid var(--rule);
	}

	.panel-meta {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		color: var(--ink-faint);
	}

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
		background: var(--paper);
		box-shadow: inset 0 -2px var(--accent);
		color: var(--ink);
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

	.tab-head {
		gap: 0;
		padding: 0;
		background: var(--paper);
	}

	.tab {
		flex: 1;
		min-width: 0;
		padding: 0.72rem 0.95rem;
		background: transparent;
		border: 0;
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid transparent;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 550;
		color: var(--ink-soft);
		cursor: pointer;
		text-align: left;
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
		font-size: 0.7rem;
		color: var(--ink-soft);
		background: var(--paper);
		border-top: 1px solid var(--rule);
		flex-shrink: 0;
	}

	.grow {
		flex: 1;
	}

	/* RESPONSIVE */
	@media (max-width: 880px) {
		.tool-switch {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

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

	@media (max-width: 520px) {
		.play-head {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.tool-switch {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
