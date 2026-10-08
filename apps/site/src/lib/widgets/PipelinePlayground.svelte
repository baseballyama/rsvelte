<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import CodePane from '$lib/components/CodePane.svelte';
	import { bilingual } from '$lib/i18n';
	import { outputLanguage, type CodeLanguage } from '$lib/kernel/code-language';
	import { initializePipeline, runPipeline, type PipelineResult } from '$lib/kernel/pipeline-browser';
	import { accessTable, artifactLabel, computationCount, decodeState, encodeState, examples, operations, plugins, problems, taskLabel } from '$lib/kernel/pipeline-playground';
	import { readerLang } from '$lib/lang.svelte';
	const text = bilingual(
		{
			files: { stylesheet: 'スタイル', lint: '検査結果', formatted: '整形後のソース' },
			computed: (n: number) => (n === 1 ? '計算' : `計算 ${n}`),
			reused: (n: number) => (n === 1 ? '再利用' : `再利用 ${n}`),
			cellSeparator: ' · ',
			notices: {
				copied: '実行した内容のリンクをコピーしました。',
				copyFailed: 'リンクをコピーできませんでした。ブラウザのアドレス欄の文字列を使ってください。',
				badLink: 'リンクの内容を読めなかったので、最初のサンプルを表示しています。'
			},
			input: '入力',
			operations: '行う処理',
			shareTitle: '外すと処理ごとに解析し直します。',
			share: '解析結果を共有',
			plugins: (on: number, all: number) => `プラグイン ${on}/${all}`,
			pluginLegend: '使う言語プラグイン',
			matchesInput: 'この入力に対応',
			pluginNote: '対応するプラグインを外すと、その処理は実行されません。Vue のサーバー向け出力と、Vue の入力の Svelte による整形・コード検査には対応していません。型検査と、生成したコードの実行も行いません。',
			copyLink: 'リンクをコピー',
			running: '処理中…',
			run: '実行',
			loading: '読み込み中…',
			loadFailed: '実行環境を読み込めませんでした：',
			stale: (modifier: string) => `未実行の変更があります。表示は前回の結果です。${modifier}+Enter で実行します。`,
			panes: '表示する欄',
			paneNames: { source: '入力', result: '結果', record: '処理の記録' },
			resetSample: 'サンプルに戻す',
			sourceLabel: '入力するソース',
			editorKeys: 'Tab は字下げ。Esc の後に Tab でエディタの外へ移動',
			lines: (n: number) => `${n} 行`,
			resultLabel: '処理の結果',
			executedTasks: '実行した処理',
			resultTabs: '確認する結果',
			artifacts: '構文木・解析結果',
			problems: (n: number) => `診断と指摘 (${n})`,
			artifact: '解析結果',
			artifactPane: '構文木または解析結果',
			position: (line: number, column: number, code: string) => `${line} 行 ${column} 列 · ${code}`,
			kinds: { diagnostic: '診断', lint: 'コード検査の指摘' },
			jump: (kind: string) => `${kind} · 入力のこの位置へ移動`,
			noProblems: 'この処理の診断と指摘はありません。',
			outputPane: '処理の出力',
			noFiles: (n: number) => `出力ファイルはありません。「診断と指摘 (${n})」を確認してください。`,
			realStructure: 'Rust が実際に持つ構造',
			pluginOutput: 'Rust のプラグインによる出力',
			nothingToRun: '実行する処理がありません',
			resultsHere: '実行結果をここに表示します',
			chooseForInput: '入力に対応するプラグインと処理を選び、実行してください。',
			choose: 'プラグインと処理を選び、実行してください。',
			record: '処理の記録',
			sharedNote: '各処理は同じ入力を読み、計算済みの解析結果を共有します。',
			isolatedNote: '共有を外しているので、処理ごとに解析し直します。',
			noPassing: '前の処理の出力は次の処理に渡しません。',
			parses: '構文の読み取り',
			computations: '解析結果の計算',
			times: (n: number) => `${n} 回`,
			tableCaption: '解析結果ごとに、各処理が計算したか再利用したかを示します。空欄は使っていない解析結果です。',
			recordEmpty: '実行した処理と、解析結果の計算・再利用をここに表示します。'
		},
		{
			files: { stylesheet: 'Styles', lint: 'Lint results', formatted: 'Formatted source' },
			computed: (n: number) => (n === 1 ? 'computed' : `computed ${n}`),
			reused: (n: number) => (n === 1 ? 'reused' : `reused ${n}`),
			cellSeparator: ', ',
			notices: {
				copied: 'Copied a link to what you ran.',
				copyFailed: 'Could not copy the link. Use the address in the browser address bar.',
				badLink: 'Could not read the state in the link, so the first sample is shown.'
			},
			input: 'Input',
			operations: 'Tasks to run',
			shareTitle: 'When this is off, each task analyzes the source again.',
			share: 'Share analysis results',
			plugins: (on: number, all: number) => `Plugins ${on}/${all}`,
			pluginLegend: 'Language plugins to use',
			matchesInput: 'Handles this input',
			pluginNote: 'When you turn off the matching plugin, its tasks do not run. Server output for Vue is not supported, and neither is formatting or linting Vue input with Svelte. The playground does not type check or run the generated code.',
			copyLink: 'Copy link',
			running: 'Running…',
			run: 'Run',
			loading: 'Loading…',
			loadFailed: 'Could not load the runtime: ',
			stale: (modifier: string) => `You have changes that have not run. The result shown is from the last run. Press ${modifier}+Enter to run.`,
			panes: 'Panel to show',
			paneNames: { source: 'Input', result: 'Result', record: 'Work log' },
			resetSample: 'Reset to sample',
			sourceLabel: 'Source to process',
			editorKeys: 'Tab indents. To leave the editor, press Esc and then Tab',
			lines: (n: number) => (n === 1 ? '1 line' : `${n} lines`),
			resultLabel: 'Task results',
			executedTasks: 'Tasks that ran',
			resultTabs: 'Result to view',
			artifacts: 'Syntax tree and analysis results',
			problems: (n: number) => `Diagnostics and findings (${n})`,
			artifact: 'Analysis result',
			artifactPane: 'Syntax tree or analysis result',
			position: (line: number, column: number, code: string) => `Line ${line}, column ${column}: ${code}`,
			kinds: { diagnostic: 'Diagnostic', lint: 'Lint finding' },
			jump: (kind: string) => `${kind}. Go to this position in the input.`,
			noProblems: 'This task has no diagnostics or findings.',
			outputPane: 'Task output',
			noFiles: (n: number) => `This task wrote no output files. See "Diagnostics and findings (${n})".`,
			realStructure: 'The structure that Rust actually holds',
			pluginOutput: 'Output of the Rust plugin',
			nothingToRun: 'No task to run',
			resultsHere: 'Results appear here',
			chooseForInput: 'Choose a plugin that handles the input and a task, then run.',
			choose: 'Choose plugins and tasks, then run.',
			record: 'Work log',
			sharedNote: 'Each task reads the same input and shares the analysis results that are already computed.',
			isolatedNote: 'Sharing is off, so each task analyzes the source again.',
			noPassing: 'The output of one task is not passed to the next task.',
			parses: 'Parses',
			computations: 'Analysis results computed',
			times: (n: number) => `${n}`,
			tableCaption: 'For each analysis result, this shows whether each task computed it or reused it. An empty cell means the task did not use that result.',
			recordEmpty: 'The tasks that ran, and the analysis results they computed or reused, appear here.'
		}
	);
	const lang = $derived(readerLang());
	const paneIds = ['source', 'result', 'record'] as const;
	const t = $derived(text[lang]);
	let exampleId = $state('svelte');
	let drafts = $state(Object.fromEntries(examples.map((example) => [example.id, example.source])));
	let enabledPlugins = $state(['svelte', 'vue', 'svue', 'vuelte']);
	let selectedOperations = $state(['compile-client', 'format', 'lint']);
	let shared = $state(true);
	let ready = $state(false);
	let running = $state(false);
	let loadError = $state('');
	let notice = $state<'' | 'copied' | 'copyFailed' | 'badLink'>('');
	let result = $state<PipelineResult | null>(null);
	let executedInput = $state('');
	let executedFilename = $state('');
	let executedShared = $state(true);
	let executedLanguage = $state<CodeLanguage>('svelte');
	let selectedStep = $state(0);
	let view = $state<'output' | 'artifacts' | 'diagnostics'>('output');
	let artifactIndex = $state(0);
	let fileIndex = $state(0);
	let pane = $state<'source' | 'result' | 'record'>('source');
	let source = $state<CodePane>();
	const example = $derived(examples.find((item) => item.id === exampleId)!);
	const language = $derived<CodeLanguage>(example.filename.endsWith('.svelte') ? 'svelte' : 'vue');
	const request = $derived({ source: drafts[exampleId], filename: example.filename, plugins: enabledPlugins, operations: selectedOperations, shared });
	const currentInput = $derived(JSON.stringify(request));
	const stale = $derived(result !== null && currentInput !== executedInput);
	const steps = $derived(result?.ok ? result.steps : []);
	const step = $derived(steps[selectedStep]);
	const snapshots = $derived(step?.artifacts ?? []);
	const snapshot = $derived(snapshots[artifactIndex]);
	const file = $derived(step?.files[fileIndex]);
	const table = $derived(accessTable(steps));
	const stepProblems = $derived(step ? problems(step) : []);
	const computations = $derived(computationCount(steps));
	const parseCount = $derived(steps.reduce((count, item) => count + item.accesses.filter((access) => !access.cached && (access.name === 'svelte.parse' || access.name === 'vue.parse')).length, 0));
	const modifier = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
	function toggle(values: string[], id: string) { return values.includes(id) ? values.filter((value) => value !== id) : [...values, id]; }
	function chooseStep(index: number) { selectedStep = index; fileIndex = 0; artifactIndex = 0; if (view === 'diagnostics' && problems(steps[index]).length === 0) view = 'output'; }
	function fileLabel(name: string) { return name === 'js' ? 'JavaScript' : name === 'css' ? t.files.stylesheet : name === 'lint.json' ? t.files.lint : t.files.formatted; }
	function cellText(cell: { computed: number; reused: number }) {
		const parts = [];
		if (cell.computed) parts.push(t.computed(cell.computed));
		if (cell.reused) parts.push(t.reused(cell.reused));
		return parts.join(t.cellSeparator);
	}
	async function execute() {
		if (!ready || running) return;
		running = true;
		const input = structuredClone($state.snapshot(request));
		const inputLanguage = language;
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		try { result = runPipeline(input); }
		catch (error) { result = { ok: false, message: error instanceof Error ? error.message : String(error) }; }
		executedInput = JSON.stringify(input);
		executedFilename = input.filename;
		executedShared = input.shared;
		executedLanguage = inputLanguage;
		selectedStep = 0; fileIndex = 0; artifactIndex = 0; view = 'output'; running = false;
		const state = { example: exampleId, source: input.source, plugins: input.plugins, operations: input.operations, shared: input.shared };
		replaceState(location.pathname + location.search + await encodeState(state), {});
	}
	async function copyLink() {
		try { await navigator.clipboard.writeText(location.href); notice = 'copied'; }
		catch { notice = 'copyFailed'; }
	}
	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); void execute().then(() => { if (pane === 'source') pane = 'result'; }); }
	}
	onMount(() => {
		let disposed = false;
		decodeState(location.hash).then((state) => {
			if (!state || disposed) return;
			exampleId = state.example; drafts[state.example] = state.source; enabledPlugins = state.plugins; selectedOperations = state.operations; shared = state.shared;
		}).catch(() => { notice = 'badLink'; })
			.then(() => initializePipeline())
			.then(() => { if (!disposed) { ready = true; void execute(); } })
			.catch((error: unknown) => { if (!disposed) loadError = error instanceof Error ? error.message : String(error); });
		return () => { disposed = true; };
	});
</script>

<svelte:window onkeydown={keydown} />

<div class="playground">
	<div class="toolbar">
		<label class="example">{t.input}<select bind:value={exampleId}>{#each examples as item (item.id)}<option value={item.id}>{item.name[lang]}</option>{/each}</select></label>
		<fieldset class="chips"><legend>{t.operations}</legend>
			{#each operations as operation (operation.id)}
				<label class="chip" title={operation.description[lang]}><input type="checkbox" checked={selectedOperations.includes(operation.id)} onchange={() => { selectedOperations = toggle(selectedOperations, operation.id); }} /><span>{operation.name[lang]}</span></label>
			{/each}
		</fieldset>
		<label class="chip share" title={t.shareTitle}><input type="checkbox" bind:checked={shared} /><span>{t.share}</span></label>
		<details class="plugins">
			<summary>{t.plugins(enabledPlugins.length, plugins.length)}</summary>
			<div class="plugin-panel"><fieldset><legend>{t.pluginLegend}</legend>
				{#each plugins as plugin (plugin.id)}
					<label class="option"><input type="checkbox" checked={enabledPlugins.includes(plugin.id)} onchange={() => { enabledPlugins = toggle(enabledPlugins, plugin.id); }} /><span>{plugin.name[lang]}{#if plugin.id === example.plugin}<small>{t.matchesInput}</small>{/if}<small class="description">{plugin.description[lang]}</small></span></label>
				{/each}
			</fieldset>
			<p>{t.pluginNote}</p></div>
		</details>
		<div class="actions">
			<button class="quiet-button" onclick={copyLink} disabled={!result}>{t.copyLink}</button>
			<button class="run-button" disabled={!ready || running} onclick={execute} aria-keyshortcuts="Control+Enter Meta+Enter"><span aria-hidden="true">▶</span>{running ? t.running : ready ? t.run : t.loading}<kbd>{modifier}+Enter</kbd></button>
		</div>
	</div>
	<div class="status" role="status" aria-live="polite">
		{#if loadError}<p class="error">{t.loadFailed}{loadError}</p>{:else if stale}<p class="stale">{t.stale(modifier)}</p>{:else if result && !result.ok}<p class="error">{result.message}</p>{/if}
		{#if notice}<p class="notice">{t.notices[notice]}</p>{/if}
	</div>
	<div class="pane-switch" role="group" aria-label={t.panes}>
		{#each paneIds as id (id)}<button aria-pressed={pane === id} onclick={() => { pane = id; }}>{t.paneNames[id]}</button>{/each}
	</div>
	<div class="workspace">
		<section class="source-panel" class:shown={pane === 'source'} aria-label={t.input}>
			<div class="pane-heading"><h2>{t.input}</h2><code>{example.filename}</code><button class="quiet-button" onclick={() => { drafts[exampleId] = example.source; }}>{t.resetSample}</button></div>
			<div class="code-area"><CodePane bind:this={source} editable bind:value={drafts[exampleId]} {language} label={t.sourceLabel} hint="editor-keys" /></div>
			<div class="pane-footer"><span id="editor-keys">{t.editorKeys}</span><span>{t.lines(drafts[exampleId].split('\n').length)}</span></div>
		</section>
		<section class="output-panel" class:shown={pane === 'result'} aria-label={t.resultLabel} aria-busy={running}>
			{#if step}
				<div class="task-tabs" role="tablist" aria-label={t.executedTasks}>
					{#each steps as item, index (item.id)}<button role="tab" aria-selected={selectedStep === index} onclick={() => chooseStep(index)}>{taskLabel(item.id, lang)}{#if problems(item).length}<span class="badge">{problems(item).length}</span>{/if}</button>{/each}
				</div>
				<div class="output-tabs" role="group" aria-label={t.resultTabs}>
					{#each step.files as item, index (index)}<button aria-pressed={view === 'output' && fileIndex === index} onclick={() => { view = 'output'; fileIndex = index; }}>{fileLabel(item.name)}</button>{/each}
					<button aria-pressed={view === 'artifacts'} onclick={() => { view = 'artifacts'; }} disabled={snapshots.length === 0}>{t.artifacts}</button>
					<button aria-pressed={view === 'diagnostics'} onclick={() => { view = 'diagnostics'; }}>{t.problems(stepProblems.length)}</button>
				</div>
				{#if view === 'artifacts' && snapshot}<div class="snapshot-picker"><label for="pipeline-artifact">{t.artifact}</label><select id="pipeline-artifact" bind:value={artifactIndex}>{#each snapshots as item, index (index)}<option value={index}>{artifactLabel(item.name, lang).name}</option>{/each}</select></div><div class="code-area"><CodePane value={snapshot.text} language="rust" label={t.artifactPane} /></div>
				{:else if view === 'diagnostics'}
					<div class="diagnostics">
						{#each stepProblems as problem, index (index)}<button class="diagnostic" onclick={() => { pane = 'source'; source?.select(problem.line, problem.column); }}><strong>{t.position(problem.line, problem.column, problem.code)}</strong><span>{problem.message}</span><small>{t.jump(t.kinds[problem.kind])}</small></button>
						{:else}<p class="empty-state">{t.noProblems}</p>{/each}
					</div>
				{:else if file}<div class="code-area"><CodePane value={file.text} language={outputLanguage(file.name, executedLanguage)} label={t.outputPane} /></div>
				{:else}<p class="empty-state">{t.noFiles(stepProblems.length)}</p>{/if}
				<div class="pane-footer"><span>{view === 'artifacts' ? t.realStructure : t.pluginOutput}</span><span>{executedFilename}</span></div>
			{:else}<div class="empty-state"><h3>{result?.ok ? t.nothingToRun : t.resultsHere}</h3><p>{result?.ok ? t.chooseForInput : t.choose}</p></div>{/if}
		</section>
	</div>
	<section class="record" class:shown={pane === 'record'} aria-labelledby="record-heading">
		<div class="record-heading">
			<h2 id="record-heading">{t.record}</h2>
			<p>{executedShared ? t.sharedNote : t.isolatedNote}{lang === 'en' ? ' ' : ''}{t.noPassing}</p>
			{#if steps.length}<span class="counts">{t.parses} <strong>{t.times(parseCount)}</strong><span aria-hidden="true">/</span>{t.computations} <strong>{t.times(computations)}</strong></span>{/if}
		</div>
		{#if steps.length}
			<div class="table-scroll">
				<table>
					<caption>{t.tableCaption}</caption>
					<thead><tr><th scope="col">{t.artifact}</th>{#each steps as item, index (item.id)}<th scope="col"><button class:active={selectedStep === index} onclick={() => { chooseStep(index); pane = 'result'; }}>{taskLabel(item.id, lang)}</button></th>{/each}</tr></thead>
					<tbody>
						{#each table as row (row.name)}
							<tr><th scope="row" title={artifactLabel(row.name, lang).description}>{artifactLabel(row.name, lang).name}<code>{row.name}</code></th>{#each row.cells as cell, index (index)}<td class:computed={cell.computed > 0} class:reused={cell.computed === 0 && cell.reused > 0}>{cellText(cell)}</td>{/each}</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}<p class="empty-state">{t.recordEmpty}</p>{/if}
	</section>
</div>

<style>
	.playground { border: 1px solid var(--border-strong); border-radius: 5px; overflow: hidden; color: var(--fg); background: var(--raised); }
	button { cursor: pointer; }
	button:disabled { opacity: .55; cursor: not-allowed; }
	button:focus-visible, select:focus-visible, input:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	h2, h3 { font-size: 12px; font-weight: 600; }
	.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--surface); font-size: 12px; }
	.example { display: flex; align-items: center; gap: 8px; color: var(--muted); }
	select { max-width: 100%; border: 1px solid var(--border); border-radius: 4px; background: var(--raised); color: var(--fg-2); padding: 6px 25px 6px 9px; font-size: 12px; }
	.chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
	.chips legend { float: left; margin-right: 6px; color: var(--muted); }
	.chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid var(--border); border-radius: 999px; cursor: pointer; color: var(--fg-2); background: var(--raised); }
	.chip:has(input:checked) { border-color: var(--fg-2); color: var(--fg); }
	.chip input { width: 13px; height: 13px; accent-color: var(--fg-2); }
	.chip:has(input:focus-visible) { outline: 2px solid var(--accent); outline-offset: 2px; }
	.share { border-style: dashed; }
	.plugins { position: relative; }
	.plugins summary { padding: 5px 10px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; color: var(--fg-2); background: var(--raised); }
	.plugin-panel { position: absolute; z-index: 5; top: calc(100% + 6px); left: 0; width: min(340px, 86vw); background: var(--raised); border: 1px solid var(--border-strong); border-radius: 4px; padding: 12px 14px; box-shadow: 0 6px 20px rgb(0 0 0 / .08); }
	.plugin-panel p { margin-top: 8px; font-size: 11px; line-height: 1.8; color: var(--muted); }
	.plugins legend { font-weight: 600; margin-bottom: 6px; }
	.option { display: flex; align-items: flex-start; gap: 9px; padding: 5px 0; cursor: pointer; line-height: 1.6; }
	.option input { margin-top: 3px; width: 14px; height: 14px; flex-shrink: 0; accent-color: var(--fg-2); }
	.option small { display: block; color: var(--accent); font-size: 10px; }
	.option small.description { color: var(--muted); }
	.actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
	.quiet-button { font-size: 11px; color: var(--muted); }
	.quiet-button:hover:not(:disabled) { color: var(--fg); }
	.run-button { display: flex; align-items: center; gap: 9px; background: var(--fg); color: var(--bg); padding: 7px 13px; border-radius: 4px; font-size: 12px; font-weight: 500; }
	.run-button > span { font-size: 9px; }
	kbd { font: 10px var(--font-mono, monospace); opacity: .7; }
	.status p { padding: 8px 15px; font-size: 11px; line-height: 1.8; border-bottom: 1px solid var(--border); }
	.stale { color: var(--warn); background: var(--warn-wash); }
	.error { color: var(--accent); background: var(--accent-wash); }
	.notice { color: var(--fg-2); background: var(--sunken); }
	.pane-switch { display: none; }
	.workspace { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); height: clamp(320px, calc(100dvh - 430px), 560px); }
	.source-panel, .output-panel { min-width: 0; min-height: 0; display: flex; flex-direction: column; }
	.source-panel { border-right: 1px solid var(--border); }
	.pane-heading { display: flex; align-items: center; gap: 12px; height: 41px; flex-shrink: 0; padding: 0 15px; border-bottom: 1px solid var(--border); }
	.pane-heading code { font: 11px var(--font-mono, monospace); color: var(--muted); }
	.pane-heading .quiet-button { margin-left: auto; }
	.code-area { flex: 1; min-height: 0; overflow: hidden; }
	.pane-footer { display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid var(--border); padding: 7px 13px; color: var(--muted); font-size: 10px; }
	.task-tabs { display: flex; overflow-x: auto; flex-shrink: 0; border-bottom: 1px solid var(--border); background: var(--sunken); }
	.task-tabs button { display: flex; align-items: center; gap: 6px; padding: 11px 13px; white-space: nowrap; color: var(--muted); font-size: 11.5px; border-right: 1px solid var(--border); }
	.task-tabs button[aria-selected='true'] { color: var(--fg); background: var(--raised); box-shadow: inset 0 2px 0 var(--accent); }
	.badge { min-width: 16px; padding: 0 5px; border-radius: 8px; background: var(--accent-wash); color: var(--accent); font-size: 10px; text-align: center; }
	.output-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid var(--border); flex-shrink: 0; padding: 0 8px; }
	.output-tabs button { padding: 9px 10px; white-space: nowrap; color: var(--muted); font-size: 11px; border-bottom: 2px solid transparent; }
	.output-tabs button[aria-pressed='true'] { color: var(--fg); border-bottom-color: var(--fg-2); }
	.snapshot-picker { display: flex; align-items: center; gap: 10px; padding: 7px 13px; font-size: 11px; border-bottom: 1px solid var(--border); }
	.snapshot-picker label { flex-shrink: 0; color: var(--muted); }
	.snapshot-picker select { min-width: 0; flex: 1; }
	.diagnostics { flex: 1; overflow: auto; }
	.diagnostic { display: grid; gap: 4px; width: 100%; padding: 11px 15px; border-bottom: 1px solid var(--border); text-align: left; font-size: 11.5px; }
	.diagnostic strong { color: var(--accent); font-weight: 600; }
	.diagnostic span { font: 11px/1.7 var(--font-mono, monospace); white-space: pre-wrap; color: var(--fg-2); }
	.diagnostic small { color: var(--muted); font-size: 10px; }
	.diagnostic:hover { background: var(--sunken); }
	.empty-state { flex: 1; padding: 32px 22px; color: var(--muted); font-size: 12px; line-height: 1.8; }
	.empty-state h3 { color: var(--fg-2); margin-bottom: 8px; }
	.record { border-top: 1px solid var(--border-strong); }
	.record-heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
	.record-heading p { font-size: 11px; color: var(--muted); line-height: 1.7; }
	.counts { margin-left: auto; font-size: 11px; color: var(--muted); }
	.counts strong { font-weight: 500; color: var(--fg-2); margin: 0 10px 0 5px; }
	.table-scroll { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
	caption { caption-side: bottom; text-align: left; padding: 9px 16px; font-size: 10.5px; color: var(--muted); }
	th, td { padding: 7px 12px; border-bottom: 1px solid var(--border); text-align: left; white-space: nowrap; }
	thead th { padding: 0; font-weight: 500; color: var(--muted); }
	thead th:first-child { padding: 7px 16px; }
	thead button { width: 100%; padding: 8px 12px; text-align: left; color: var(--muted); font-size: 11px; }
	thead button.active { color: var(--fg); box-shadow: inset 0 -2px 0 var(--accent); }
	tbody th { padding-left: 16px; font-weight: 400; color: var(--fg-2); }
	tbody th code { margin-left: 8px; font: 10px var(--font-mono, monospace); color: var(--muted); }
	td.computed { color: var(--fg); background: var(--warn-wash); }
	td.reused { color: var(--info); }
	@media (max-width: 1100px) { tbody th code { display: none; } }
	@media (max-width: 700px) {
		.toolbar { padding: 10px; gap: 8px; }
		.actions { width: 100%; justify-content: space-between; margin-left: 0; }
		.pane-switch { position: sticky; top: 0; z-index: 4; display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--border); background: var(--surface); }
		.pane-switch button { padding: 10px 0; font-size: 12px; color: var(--muted); }
		.pane-switch button[aria-pressed='true'] { color: var(--fg); box-shadow: inset 0 -2px 0 var(--accent); }
		.workspace { display: block; height: auto; }
		.source-panel, .output-panel, .record { display: none; }
		.source-panel.shown, .output-panel.shown { display: flex; height: 70dvh; min-height: 360px; border-right: 0; }
		.record.shown { display: block; border-top: 0; }
		.counts { margin-left: 0; }
	}
</style>
