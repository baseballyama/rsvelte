<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { overviewEdges, overviewNodes, positionLabel, sharedParts } from '$lib/kernel/kernel-overview';
	import { REPO_URL } from '$lib/site';

	let { current = [] }: { current?: string[] } = $props();
	const order = ['host', 'registry', 'plugin-check', 'run', 'run-document', 'lang-tools', 'context', 'lang-core', 'facet', 'output', 'project', 'typecheck'];
	const byId = new Map(overviewNodes.map((node) => [node.id, node]));
	const groups = [
		{ label: '言語プラグイン', x: 16, y: 132, w: 220, h: 304 },
		{ label: 'カーネル（rsvelte_kernel）', x: 290, y: 24, w: 440, h: 586 },
		{ label: '', x: 778, y: 140, w: 198, h: 102 }
	];
	const partWidth = 76;
	const partGap = 6;
	const partPosition = (index: number) => ({ x: 306 + (index % 5) * (partWidth + partGap), y: 466 + Math.floor(index / 5) * 34 });
	const sourceUrl = (source: { path: string; line: number }) => `${REPO_URL}/blob/experimental/${source.path}#L${source.line}`;
</script>

<Figure label="図 1.1 · カーネルと言語プラグインの役割とデータの流れ" wide>
	<div class="overview">
		<svg viewBox="0 -24 980 650" role="group" aria-labelledby="overview-title">
			<title id="overview-title">カーネルと言語プラグインの全体図。各部分は対応する章へのリンクです。</title>
			<defs>
				<marker id="overview-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" class="arrow-head" /></marker>
			</defs>
			{#each groups as group (group.x)}
				<rect class="group" x={group.x} y={group.y} width={group.w} height={group.h} rx="6" />
				{#if group.label}<text class="group-label" x={group.x + 12} y={group.y + 20}>{group.label}</text>{/if}
			{/each}
			<g aria-hidden="true">
				{#each overviewEdges as edge (edge.from + edge.to)}
					<path class="edge" d={edge.path} marker-end="url(#overview-arrow)" />
					<text class="edge-label" x={edge.at[0]} y={edge.at[1]}>{edge.label}</text>
				{/each}
			</g>
			{#each overviewNodes as node (node.id)}
				<a href={node.href} class:current={current.includes(node.id)} aria-current={current.includes(node.id) ? 'location' : undefined}>
					<rect class="node" x={node.box.x} y={node.box.y} width={node.box.w} height={node.box.h} rx="4" />
					<text class="node-label" x={node.box.x + 12} y={node.box.y + 25}>{node.label}</text>
					<text class="node-code" x={node.box.x + 12} y={node.box.y + 45}>{node.code}</text>
				</a>
			{/each}
			<text class="group-label" x="306" y="454">どの処理も使う共通部品</text>
			{#each sharedParts as part, index (part.id)}
				{@const p = partPosition(index)}
				<a href={part.href} class:current={current.includes(`part:${part.id}`)} aria-current={current.includes(`part:${part.id}`) ? 'location' : undefined}>
					<rect class="part" x={p.x} y={p.y} width={partWidth} height="26" rx="3" />
					<text class="part-label" x={p.x + partWidth / 2} y={p.y + 17} text-anchor="middle">{part.label}</text>
				</a>
			{/each}
		</svg>
		<ol class="flow-list" aria-label="全体図の要素（データの流れの順）">
			{#each order as id (id)}
				{@const node = byId.get(id)!}
				<li class:current={current.includes(id)}><a href={node.href} aria-current={current.includes(id) ? 'location' : undefined}><strong>{node.label}</strong><code>{node.code}</code></a><p>{node.what}</p></li>
			{/each}
			<li><strong>どの処理も使う共通部品</strong><p>{#each sharedParts as part, index (part.id)}{#if index > 0}、{/if}<a href={part.href} class:current-link={current.includes(`part:${part.id}`)} aria-current={current.includes(`part:${part.id}`) ? 'location' : undefined}>{part.label}</a>{/each}</p></li>
		</ol>
	</div>
	<details class="relations">
		<summary>図の矢印を文章で読む（根拠のソース付き）</summary>
		<ol>
			{#each overviewEdges as edge (edge.from + edge.to)}
				<li>{edge.sentence}<a href={sourceUrl(edge.source)} class="source-link"><code>{edge.source.path.replace(/^crates\//, '')}:{edge.source.line}</code></a></li>
			{/each}
		</ol>
		{#if current.length}<p class="here">この章の位置：{current.map(positionLabel).join('、')}</p>{/if}
	</details>
	{#snippet caption()}矢印は登録とデータの向きです。crate の依存関係ではありません。四角を選ぶと、その部分を説明する章へ移動します。{/snippet}
</Figure>

<style>
	.overview { padding: 12px 8px 4px; }
	svg { display: block; width: 100%; height: auto; font-family: inherit; }
	.group { fill: var(--surface); stroke: var(--border); }
	.group-label { font-size: 12px; font-weight: 600; fill: var(--muted); }
	.node { fill: var(--raised); stroke: var(--border-strong); }
	.node-label { font-size: 13.5px; font-weight: 600; fill: var(--fg); }
	.node-code { font-size: 10.5px; fill: var(--muted); font-family: var(--font-mono, monospace); }
	.part { fill: var(--raised); stroke: var(--border); }
	.part-label { font-size: 10.5px; fill: var(--fg-2); }
	a:hover .node, a:hover .part, a:focus-visible .node, a:focus-visible .part { stroke: var(--accent); stroke-width: 2; }
	a:focus-visible { outline: none; }
	a.current .node, a.current .part { fill: var(--accent-wash); stroke: var(--accent); stroke-width: 2; }
	.edge { fill: none; stroke: var(--muted); stroke-width: 1.2; }
	.arrow-head { fill: var(--muted); }
	.edge-label { font-size: 10px; fill: var(--muted); }
	.flow-list { display: none; list-style: none; padding: 4px 8px; }
	.flow-list li { padding: 10px 4px; border-bottom: 1px solid var(--border); }
	.flow-list li.current { background: var(--accent-wash); }
	.flow-list a { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
	.flow-list strong { font-size: 14px; }
	.flow-list code { font-size: 11px; color: var(--muted); }
	.flow-list p { margin-top: 3px; font-size: 12.5px; line-height: 1.7; color: var(--fg-2); }
	.flow-list p a { display: inline; text-decoration: underline; text-underline-offset: 3px; }
	.flow-list .current-link { font-weight: 600; color: var(--accent); }
	.relations { margin: 4px 12px 12px; font-size: 12.5px; color: var(--fg-2); }
	.relations summary { cursor: pointer; color: var(--muted); }
	.relations ol { margin-top: 8px; padding-left: 20px; line-height: 1.9; }
	.source-link { margin-left: 8px; color: var(--muted); }
	.source-link code { font-size: 11px; }
	.here { margin-top: 8px; color: var(--accent); }
	@media (max-width: 640px) { svg { display: none; } .flow-list { display: block; } }
</style>
