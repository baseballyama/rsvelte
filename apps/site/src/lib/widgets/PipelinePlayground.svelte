<script lang="ts">
	import { onMount } from 'svelte';
	import CodePane from '$lib/components/CodePane.svelte';
	import { outputLanguage, type CodeLanguage } from '$lib/kernel/code-language';
	import { initializePipeline, runPipeline, type PipelineResult } from '$lib/kernel/pipeline-browser';
	import { accessSummary, artifactLabel, computationCount, examples, operations, plugins, taskLabel } from '$lib/kernel/pipeline-playground';
	let exampleId = $state('svelte');
	let drafts = $state(Object.fromEntries(examples.map((example) => [example.id, example.source])));
	let enabledPlugins = $state(['svelte', 'vue', 'svue']);
	let selectedOperations = $state(['compile-client', 'format', 'lint']);
	let shared = $state(true);
	let ready = $state(false);
	let running = $state(false);
	let loadError = $state('');
	let result = $state<PipelineResult | null>(null);
	let executedInput = $state('');
	let executedFilename = $state('');
	let executedShared = $state(true);
	let executedLanguage = $state<CodeLanguage>('svelte');
	let selectedStep = $state(0);
	let view = $state('output');
	let artifactIndex = $state(0);
	let fileIndex = $state(0);
	const example = $derived(examples.find((item) => item.id === exampleId)!);
	const language = $derived<CodeLanguage>(exampleId === 'svelte' ? 'svelte' : 'vue');
	const request = $derived({ source: drafts[exampleId], filename: example.filename, plugins: enabledPlugins, operations: selectedOperations, shared });
	const currentInput = $derived(JSON.stringify(request));
	const stale = $derived(result !== null && currentInput !== executedInput);
	const steps = $derived(result?.ok ? result.steps : []);
	const step = $derived(steps[selectedStep]);
	const accesses = $derived(step ? accessSummary(step) : []);
	const snapshots = $derived(steps.flatMap((item) => item.artifacts));
	const snapshot = $derived(snapshots[artifactIndex]);
	const file = $derived(step?.files[fileIndex]);
	const computations = $derived(computationCount(steps));
	const parseCount = $derived(steps.reduce((count, item) => count + item.accesses.filter((access) => !access.cached && (access.name === 'svelte.parse' || access.name === 'vue.parse')).length, 0));
	function toggle(values: string[], id: string) { return values.includes(id) ? values.filter((value) => value !== id) : [...values, id]; }
	function chooseStep(index: number) { selectedStep = index; fileIndex = 0; view = 'output'; }
	function fileLabel(name: string) { return name === 'js' ? 'JavaScript' : name === 'css' ? 'スタイル' : name === 'lint.json' ? '検査結果' : '整形後のソース'; }
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
	}
	onMount(() => {
		let disposed = false;
		initializePipeline().then(() => { if (!disposed) { ready = true; void execute(); } }).catch((error: unknown) => {
			if (!disposed) loadError = error instanceof Error ? error.message : String(error);
		});
		return () => { disposed = true; };
	});
</script>

<div class="playground">
	<div class="toolbar">
		<label class="language-control">入力する言語<select aria-label="入力する言語" bind:value={exampleId}>{#each examples as item (item.id)}<option value={item.id}>{item.name}</option>{/each}</select></label>
		<span class="privacy">ソースはブラウザ内で処理します</span>
		<button class="run-button" disabled={!ready || running} onclick={execute}><span aria-hidden="true">▶</span>{running ? '処理中…' : ready ? '実行' : '読み込み中…'}</button>
	</div>
	<div class="workspace">
		<aside class="settings" aria-label="パイプラインの設定">
			<h2>設定</h2>
			<fieldset><legend>言語プラグイン</legend>
				{#each plugins as plugin (plugin.id)}
					<label class="option" title={plugin.description}><input type="checkbox" checked={enabledPlugins.includes(plugin.id)} onchange={() => { enabledPlugins = toggle(enabledPlugins, plugin.id); }} /><span>{plugin.name}{#if plugin.id === example.plugin}<small>この入力に対応</small>{/if}</span></label>
				{/each}
			</fieldset>
			<fieldset><legend>行う処理</legend>
				{#each operations as operation (operation.id)}
					<label class="option" title={operation.description}><input type="checkbox" checked={selectedOperations.includes(operation.id)} onchange={() => { selectedOperations = toggle(selectedOperations, operation.id); }} /><span>{operation.name}</span></label>
				{/each}
			</fieldset>
			<div class="sharing"><label class="option"><input type="checkbox" bind:checked={shared} /><span>解析結果を共有</span></label><p>外すと処理ごとに解析し直します。</p></div>
			<details class="help"><summary>試し方と対応範囲</summary><p>対応するプラグインを外すと、処理がなくなります。整形だけを選ぶと、必要な解析だけを計算します。</p><p>Vue のサーバー向け出力と、Vue の構文 + Svelte の整形・コード検査には対応していません。型検査と生成したコードの実行も行いません。</p></details>
		</aside>
		<section class="source-panel" aria-label="入力">
			<div class="pane-heading"><h2>入力</h2><code>{example.filename}</code><button class="quiet-button" onclick={() => { drafts[exampleId] = example.source; }}>サンプルに戻す</button></div>
			<div class="code-area"><CodePane editable bind:value={drafts[exampleId]} {language} label="入力するソース" /></div>
			<div class="pane-footer">{drafts[exampleId].split('\n').length} 行<span>言語ごとに編集内容を保持</span></div>
		</section>
		<section class="output-panel" aria-label="処理の結果" aria-busy={running}>
			<div class="pane-heading"><h2>結果</h2>{#if step}<select aria-label="結果を確認する処理" bind:value={selectedStep} onchange={() => { fileIndex = 0; view = 'output'; }}>{#each steps as item, index (item.id)}<option value={index}>{taskLabel(item.id)}</option>{/each}</select>{/if}</div>
			<div class="result-status" role="status" aria-live="polite">
				{#if loadError}<p class="error">実行環境を読み込めませんでした：{loadError}</p>{:else if stale}<p class="stale">未実行の変更があります。表示は前回の結果です。</p>{:else if result && !result.ok}<p class="error">{result.message}</p>{/if}
			</div>
			{#if step}
				<div class="output-tabs" aria-label="確認する結果">
					{#each step.files as item, index (index)}<button class:active={view === 'output' && fileIndex === index} aria-pressed={view === 'output' && fileIndex === index} onclick={() => { view = 'output'; fileIndex = index; }}>{fileLabel(item.name)}</button>{/each}
					<button class:active={view === 'artifacts'} aria-pressed={view === 'artifacts'} onclick={() => { view = 'artifacts'; }}>構文木・解析結果</button>
				</div>
				{#if view === 'artifacts'}<div class="snapshot-picker"><label for="pipeline-artifact">解析結果</label><select id="pipeline-artifact" bind:value={artifactIndex}>{#each snapshots as item, index (index)}<option value={index}>{artifactLabel(item.name).name}</option>{/each}</select></div><div class="code-area"><CodePane value={snapshot?.text ?? ''} language="rust" label="構文木または解析結果" /></div>
				{:else if file}<div class="code-area"><CodePane value={file.text} language={outputLanguage(file.name, executedLanguage)} label="処理の出力" /></div>
				{:else}<div class="empty-state">出力ファイルはありません。診断を確認してください。</div>{/if}
				{#if view === 'output'}{#each step.diagnostics as diagnostic, index (index)}<div class="diagnostic"><strong>{diagnostic.line} 行 {diagnostic.column} 列：{diagnostic.code}</strong><pre>{diagnostic.message}</pre></div>{/each}{/if}
				<div class="pane-footer">{view === 'artifacts' ? 'Rust が実際に持つ構造' : 'Rust のプラグインによる出力'}<span>{executedFilename}</span></div>
			{:else}<div class="empty-state"><h3>{result?.ok ? '実行する処理がありません' : '実行結果をここに表示します'}</h3><p>{result?.ok ? '入力に対応するプラグインと処理を選び、実行してください。' : 'プラグインと処理を選び、実行してください。'}</p></div>{/if}
		</section>
	</div>
	<section class="trace" aria-labelledby="trace-heading">
		<div class="trace-heading"><h2 id="trace-heading">処理の記録</h2>{#if steps.length}<span>構文の読み取り <strong>{parseCount} 回</strong><span class="separator">/</span>解析結果の計算 <strong>{computations} 回</strong></span>{/if}</div>
		{#if step}
			<div class="flow"><div class="flow-source"><span>共通の入力</span><code>{executedFilename}</code></div><span class="flow-arrow" aria-hidden="true">→</span><div class="task-tabs" aria-label="実行した処理">{#each steps as item, index (item.id)}<button class:active={selectedStep === index} aria-pressed={selectedStep === index} onclick={() => chooseStep(index)}>{taskLabel(item.id)}<small>計算 {item.accesses.filter((access) => !access.cached).length} · 再利用 {item.accesses.filter((access) => access.cached).length}</small></button>{/each}</div></div>
			<div class="trace-body"><p class="trace-note">各処理は同じ入力を読みます。<br />{executedShared ? '計算済みの解析結果を共有しています。' : '共有せず、処理ごとに解析しています。'}<br />前の処理の出力は渡しません。</p><div class="accesses"><h3>{taskLabel(step.id)}が使った解析結果</h3><ol>{#each accesses as access (access.name)}<li><span title={artifactLabel(access.name).description}>{artifactLabel(access.name).name}</span><span class="access-status" class:computed={access.computed > 0}>{access.computed ? '計算 ' + access.computed + ' 回' : ''}{access.computed && access.reused ? ' · ' : ''}{access.reused ? '再利用 ' + access.reused + ' 回' : ''}</span></li>{/each}</ol></div></div>
			<details class="implementation"><summary>実装名と要求順</summary><code>{step.id}</code><ol>{#each step.accesses as access, index (index)}<li><code>{access.name}</code> — {access.cached ? '再利用' : '計算'}</li>{/each}</ol></details>
		{:else}<p class="trace-empty">実行した処理と、解析結果の計算・再利用をここに表示します。</p>{/if}
	</section>
</div>

<style>
	.playground { border: 1px solid var(--border-strong); border-radius: 5px; overflow: hidden; color: var(--fg); }
	button { cursor: pointer; }
	button:disabled { opacity: .55; cursor: wait; }
	button:focus-visible, select:focus-visible, input:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.toolbar { display: flex; align-items: center; gap: 20px; min-height: 57px; padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--surface); font-size: 12px; }
	.language-control { display: flex; align-items: center; gap: 12px; }
	select { max-width: 100%; border: 1px solid var(--border); border-radius: 4px; background: var(--raised); color: var(--fg-2); padding: 6px 25px 6px 9px; font-size: 12px; }
	.privacy { margin-left: auto; color: var(--muted); }
	.run-button { display: flex; align-items: center; gap: 9px; background: var(--fg); color: var(--bg); padding: 7px 15px; border-radius: 4px; font-size: 12px; font-weight: 500; }
	.run-button span { font-size: 9px; }
	.workspace { display: grid; grid-template-columns: 220px minmax(0,1fr) minmax(0,1fr); height: clamp(430px, calc(100dvh - 450px), 600px); }
	h2, h3 { font-size: 12px; font-weight: 600; }
	.settings { padding: 17px 16px; background: var(--sunken); border-right: 1px solid var(--border); overflow: auto; }
	.settings > h2 { margin-bottom: 24px; color: var(--muted); }
	fieldset + fieldset { margin-top: 25px; }
	legend { font-size: 12px; font-weight: 600; margin-bottom: 9px; }
	.option { display: flex; align-items: flex-start; gap: 9px; padding: 6px 0; cursor: pointer; font-size: 12px; line-height: 1.7; }
	.option input { margin-top: 3px; width: 14px; height: 14px; flex-shrink: 0; accent-color: var(--fg-2); }
	.option small { display: block; color: var(--accent); font-size: 10px; }
	.sharing { margin-top: 21px; padding-top: 15px; border-top: 1px solid var(--border); }
	.sharing p, .help p { font-size: 11px; line-height: 1.8; color: var(--muted); margin-top: 5px; }
	.help { margin-top: 20px; font-size: 11px; color: var(--muted); }
	summary { cursor: pointer; }
	.source-panel, .output-panel { min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--raised); }
	.source-panel { border-right: 1px solid var(--border); }
	.pane-heading { display: flex; align-items: center; gap: 12px; height: 45px; flex-shrink: 0; padding: 0 15px; border-bottom: 1px solid var(--border); }
	.pane-heading code { font: 11px var(--font-mono,monospace); color: var(--muted); }
	.pane-heading select { margin-left: auto; max-width: 78%; border: 0; background: transparent; }
	.quiet-button { margin-left: auto; font-size: 10px; color: var(--muted); }
	.quiet-button:hover { color: var(--fg); }
	.code-area { flex: 1; min-height: 0; overflow: hidden; }
	.pane-footer { display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid var(--border); padding: 7px 13px; color: var(--muted); font-size: 10px; }
	.output-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid var(--border); flex-shrink: 0; padding: 0 8px; }
	.output-tabs button { padding: 11px 10px; white-space: nowrap; color: var(--muted); font-size: 11px; border-bottom: 2px solid transparent; }
	.output-tabs button.active { color: var(--fg); border-bottom-color: var(--accent); }
	.snapshot-picker { display: flex; align-items: center; gap: 10px; padding: 7px 13px; font-size: 11px; border-bottom: 1px solid var(--border); }
	.snapshot-picker label { flex-shrink: 0; color: var(--muted); }
	.snapshot-picker select { min-width: 0; flex: 1; }
	.stale, .error { padding: 9px 15px; font-size: 11px; line-height: 1.8; border-bottom: 1px solid var(--border); }
	.stale { color: var(--warn); background: var(--warn-wash); }
	.error { color: var(--accent); background: var(--accent-wash); }
	.empty-state { flex: 1; padding: 40px 25px; color: var(--muted); font-size: 12px; line-height: 1.8; }
	.empty-state h3 { color: var(--fg-2); margin-bottom: 8px; }
	.diagnostic { max-height: 150px; overflow: auto; padding: 10px 14px; border-top: 1px solid var(--border); font-size: 11px; color: var(--accent); flex-shrink: 0; }
	.diagnostic pre { white-space: pre-wrap; font: 11px/1.7 var(--font-mono,monospace); margin-top: 5px; }
	.trace { border-top: 1px solid var(--border-strong); background: var(--raised); }
	.trace-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
	.trace-heading > span { font-size: 11px; color: var(--muted); }
	.trace-heading strong { font-weight: 500; color: var(--fg-2); margin-left: 5px; }
	.separator { padding: 0 12px; color: var(--border-strong); }
	.flow { display: flex; align-items: stretch; gap: 20px; border-bottom: 1px solid var(--border); padding: 13px 16px; }
	.flow-source { min-width: 184px; display: flex; flex-direction: column; justify-content: center; gap: 5px; }
	.flow-source span { color: var(--muted); font-size: 10px; }
	.flow-source code { font: 12px var(--font-mono,monospace); }
	.flow-arrow { align-self: center; color: var(--muted); }
	.task-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
	.task-tabs button { padding: 7px 13px; border: 1px solid transparent; border-radius: 3px; color: var(--muted); font-size: 11px; text-align: left; }
	.task-tabs button.active { border-color: var(--border-strong); background: var(--surface); color: var(--fg); }
	.task-tabs button:hover { background: var(--sunken); }
	.task-tabs small { display: block; margin-top: 5px; font-size: 10px; color: var(--muted); }
	.trace-body { display: grid; grid-template-columns: 220px minmax(0,1fr); }
	.trace-note { padding: 17px 16px; font-size: 11px; color: var(--muted); line-height: 2; }
	.accesses { padding: 17px 24px; border-left: 1px solid var(--border); }
	.accesses h3 { font-size: 11px; margin-bottom: 8px; }
	.accesses ol { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); column-gap: 30px; list-style: none; }
	.accesses li { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; padding: 7px 0; border-bottom: 1px solid var(--border); }
	.access-status { flex-shrink: 0; color: var(--info); }
	.access-status.computed { color: var(--muted); }
	.implementation { padding: 10px 16px; border-top: 1px solid var(--border); color: var(--muted); font-size: 11px; }
	.implementation ol { padding: 8px 20px; line-height: 1.8; }
	.implementation > code { display: block; margin-top: 10px; }
	.trace-empty { padding: 18px 16px; color: var(--muted); font-size: 12px; }
	@media (max-width: 1100px) { .workspace { grid-template-columns: 190px minmax(0,1fr) minmax(0,1fr); } .settings { padding-inline: 12px; } .pane-heading { gap: 8px; padding-inline: 10px; } .quiet-button { font-size: 9px; } .accesses ol { grid-template-columns: minmax(0,1fr); } }
	@media (max-width: 850px) { .workspace { grid-template-columns: minmax(0,1fr) minmax(0,1fr); height: auto; } .settings { grid-column: 1/-1; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; border-right: 0; border-bottom: 1px solid var(--border); overflow: visible; } .settings > h2 { display: none; } fieldset + fieldset, .sharing { margin-top: 0; } .sharing { padding-top: 0; border: 0; } .help { grid-column: 1/-1; margin-top: 0; } .source-panel, .output-panel { height: 480px; } .privacy { display: none; } .run-button { margin-left: auto; } .trace-body { grid-template-columns: 190px minmax(0,1fr); } .flow-source { min-width: 154px; } .pane-footer span { display: none; } }
	@media (max-width: 580px) { .toolbar { padding: 10px; gap: 8px; } .language-control { gap: 6px; font-size: 11px; } .language-control select { max-width: 180px; } .workspace { grid-template-columns: minmax(0,1fr); } .settings { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; } .sharing, .help { grid-column: 1/-1; } .sharing p { margin-left: 23px; } .source-panel { border-right: 0; border-bottom: 1px solid var(--border-strong); height: 350px; } .output-panel { height: 430px; } .trace-heading { align-items: flex-start; flex-direction: column; } .flow { flex-wrap: wrap; gap: 8px; } .flow-source { min-width: 0; flex: 1; } .flow-arrow { display: none; } .task-tabs { width: 100%; } .trace-body { grid-template-columns: minmax(0,1fr); } .trace-note { padding-block: 10px; } .trace-note br { display: none; } .accesses { border-left: 0; padding: 12px 16px; } }
</style>
