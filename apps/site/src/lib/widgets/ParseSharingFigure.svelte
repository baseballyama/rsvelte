<script lang="ts">
	import { pipelineTasks, pipelineStages, selectedPipeline } from './svelte-pipeline';

	let { markup }: { markup: Record<string, string> } = $props();
	const STEP_DURATION_MS = 2800;
	let selected = $state(pipelineTasks.map(task => task.identifier));
	let position = $state(0);
	let playing = $state(false);
	const stages = $derived(selectedPipeline(selected));
	const current = $derived(stages[position]);
	const visited = $derived(new Set(stages.slice(0, position).map(stage => stage.identifier)));
	const shared = pipelineStages.filter(stage => ['input', 'parsed', 'normalized', 'resolved'].includes(stage.identifier));

	$effect(() => {
		if (!playing) return;
		if (position >= stages.length - 1) { playing = false; return; }
		const timer = setTimeout(() => position += 1, STEP_DURATION_MS);
		return () => clearTimeout(timer);
	});

	function reset() { playing = false; position = 0; }
	function play() {
		if (position === stages.length - 1) position = 0;
		playing = true;
	}
	function move(next: number) { playing = false; position = next; }
	function inspect(identifier: string) {
		const index = stages.findIndex(stage => stage.identifier === identifier);
		if (index >= 0) move(index);
	}
</script>

<figure class="pipeline" style:--step-duration="{STEP_DURATION_MS}ms">
	<figcaption>Greeting.svelteを、4種類のツールで処理する</figcaption>
	<p class="intro">矢印はデータの依存関係です。再生すると実行順に工程が点灯します。オレンジは現在の工程、青い破線はその工程が読む保存済みデータです。</p>
	<div class="controls">
		<div class="selection">
			{#each pipelineTasks as task}
				<label><input type="checkbox" value={task.identifier} bind:group={selected} onchange={reset} />{task.label}</label>
			{/each}
		</div>
		<div class="transport">
			<button type="button" onclick={() => playing ? playing = false : play()} disabled={!stages.length}>{playing ? '一時停止' : position === stages.length - 1 ? 'もう一度再生' : '再生'}</button>
			<button type="button" onclick={() => move(position - 1)} disabled={!position}>← 前の工程</button>
			<button type="button" onclick={() => move(position + 1)} disabled={!stages.length || position >= stages.length - 1}>次の工程 →</button>
			<button type="button" onclick={reset}>最初に戻る</button>
		</div>
	</div>
	<div class="diagram">
		<p class="boundary">文書ごとの処理 · 同じソースのスナップショットと実行コンテキスト</p>
		<div class="shared">
			{#each shared as stage, index}
				{#if index}<span class="arrow" aria-hidden="true">→</span>{/if}
				{@render node(stage.identifier)}
			{/each}
		</div>
		<p class="shared-note">ソースAST → テンプレートHIR → スコープ・宣言・参照のサイドテーブル</p>
		<div class="branches">
			{#each pipelineTasks as task}
				<div class="branch" class:disabled={!selected.includes(task.identifier)}>
					<h3>{task.label}</h3>
					<p class="dependency">↓ {task.input}を使う</p>
					{#each task.nodes as identifier, index}
						{#if index}<div class="vertical-arrow" class:flowing={playing && current?.identifier === identifier} aria-hidden="true">↓<i></i></div>{/if}
						{#if identifier === 'typescript'}<p class="project-boundary">ここから全ファイルを集約</p>{/if}
						{@render node(identifier)}
					{/each}
					<p class="output">{task.output}</p>
				</div>
			{/each}
		</div>
	</div>
	{#if current}
		<div class="progress" aria-label="工程を選択">
			{#each stages as stage, index}
				<button type="button" onclick={() => move(index)} aria-label="{index + 1}：{stage.label}" aria-current={index === position ? 'step' : undefined} class:visited={index < position}>{index + 1}</button>
			{/each}
		</div>
		<div class="inspection">
			<div class="source"><h3>入力：Greeting.svelte</h3><div class="code">{@html markup.input}</div></div>
			<div class="detail">
				<div class="description" aria-live="polite" aria-atomic="true">
					<p class="step">工程 {position + 1} / {stages.length}{position === stages.length - 1 ? ' · 完了' : ''}</p>
					<h3>{current.label}</h3><p>{current.description}</p>
				</div>
				<div class="code">{@html markup[current.identifier]}</div>
			</div>
		</div>
	{:else}<p class="empty">実行する処理を選択してください。</p>{/if}
	<p class="caption">現在の実装に沿った説明モデルです。中間データと診断は要点を抜粋しています。アニメーションの長さは実行時間を表しません。型検査器によるTypeScriptの解析は別に行われます。</p>
</figure>

{#snippet node(identifier: string)}
	{@const stage = pipelineStages.find(stage => stage.identifier === identifier)!}
	<button type="button" class="node" class:active={current?.identifier === identifier} class:read={current?.reads.includes(identifier)} class:complete={visited.has(identifier)} disabled={!stages.some(stage => stage.identifier === identifier)} onclick={() => inspect(identifier)} aria-current={current?.identifier === identifier ? 'step' : undefined}>
		<span class="node-status">{current?.identifier === identifier ? playing ? '実行中' : '現在の工程' : current?.reads.includes(identifier) ? '保存済みデータを読む' : visited.has(identifier) ? '計算済み' : '工程を選択'}</span>
		<strong>{stage.label}</strong>
		<span class="structure">{stage.structure}</span>
		{#if identifier === 'input'}<code>Greeting.svelte</code>{:else if identifier === 'parsed'}<span>Svelteソースの解析は1回</span>{/if}
	</button>
{/snippet}

<style>
	.pipeline { border: 1px solid var(--border); border-radius: 12px; background: var(--sunken); padding: clamp(16px, 3vw, 28px); margin: 32px 0; }
	figcaption { font-size: 18px; font-weight: 600; }
	.intro, .caption { font-size: 13px; line-height: 1.8; color: var(--fg-2); margin: 12px 0; }
	.controls { margin: 20px 0; display: grid; gap: 16px; }
	.selection, .transport { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
	label { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
	input { accent-color: var(--accent); width: 16px; height: 16px; }
	button { cursor: pointer; }
	.transport button { padding: 8px 12px; border: 1px solid var(--border-strong); border-radius: 6px; font-size: 13px; background: var(--bg); }
	.transport button:first-child { border-color: var(--accent); color: var(--accent); min-width: 110px; }
	button:disabled { opacity: 0.4; cursor: default; }
	button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
	.boundary { font-size: 13px; margin: 0 0 16px; }
	.diagram { border: 1px solid var(--border); border-radius: 8px; padding: 20px 16px; background: var(--bg); }
	.shared { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: center; gap: 8px; }
	.node { position: relative; display: flex; flex-direction: column; justify-content: center; gap: 6px; width: 100%; min-height: 100px; padding: 12px 8px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--surface); text-align: center; font-size: 12px; }
	.node strong { font-size: 14px; font-weight: 600; }
	.structure { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); overflow-wrap: anywhere; }
	.node-status { font-size: 11px; color: var(--muted); }
	.node code { font-size: 12px; white-space: nowrap; }
	.node.complete { border-color: var(--ok); }
	.node.read { border: 2px dashed var(--c-src); background: color-mix(in srgb, var(--c-src) 8%, var(--bg)); }
	.node.read .structure { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); overflow-wrap: anywhere; }
	.node-status { color: var(--c-src); }
	.node.active { border: 2px solid var(--accent); background: var(--accent-wash); box-shadow: 0 0 0 3px var(--accent-wash); }
	.node.active .structure { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); overflow-wrap: anywhere; }
	.node-status { color: var(--accent); }
	.arrow, .vertical-arrow { color: var(--accent); font-size: 22px; text-align: center; }
	.shared-note { font-size: 12px; color: var(--muted); text-align: center; margin: 16px 0 24px; }
	.branches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
	.branch { min-width: 0; border-top: 2px solid var(--border-strong); padding-top: 12px; }
	.branch.disabled { opacity: 0.45; }
	h3 { font-weight: 600; font-size: 16px; margin: 0; }
	.dependency { font-size: 12px; line-height: 1.7; min-height: 3.4em; color: var(--c-src); margin: 8px 0 14px; }
	.vertical-arrow { position: relative; height: 32px; overflow: hidden; }
	.vertical-arrow i { display: none; }
	.flowing i { display: block; position: absolute; left: calc(50% - 4px); width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: travel 1s linear infinite; }
	.project-boundary { padding: 8px 0; margin: 0 0 8px; border-top: 1px dashed var(--accent); font-size: 11px; color: var(--accent); }
	.output { margin: 12px 0 0; font-size: 12px; color: var(--fg-2); }
	.progress { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 16px; }
	.progress button { width: 32px; height: 32px; border: 1px solid var(--border-strong); border-radius: 50%; font-size: 12px; background: var(--bg); }
	.progress button[aria-current] { background: var(--accent); color: var(--bg); border-color: var(--accent); }
	.progress .visited { border-color: var(--ok); }
	.inspection { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
	.inspection > div { min-width: 0; }
	.source h3 { margin-bottom: 12px; }
	.description { min-height: 145px; font-size: 13px; line-height: 1.8; }
	.description p { margin: 8px 0 12px; }
	.description .step { margin: 0 0 4px; color: var(--accent); font-size: 12px; }
	.code { padding: 16px; overflow-x: auto; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; }
	.code :global(pre) { margin: 0; font-size: 14px; line-height: 1.8; }
	.caption { margin: 20px 0 0; font-size: 12px; color: var(--muted); }
	.empty { font-size: 14px; margin-top: 20px; }
	@keyframes travel { from { top: -8px; } to { top: 32px; } }
	@media (max-width: 1000px) { .branches { grid-template-columns: 1fr 1fr; gap: 24px 16px; } .shared { grid-template-columns: 1fr auto 1fr; } .shared > .arrow:nth-child(4) { display: none; } }
	@media (max-width: 650px) { .inspection { grid-template-columns: 1fr; } .description { min-height: 0; } .diagram { padding: 16px 10px; } .node strong { font-size: 13px; } .node { min-height: 110px; } }
	@media (prefers-reduced-motion: reduce) { .flowing i { animation: none; top: 12px; } }
</style>
