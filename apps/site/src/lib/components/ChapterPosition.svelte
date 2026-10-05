<script lang="ts">
	import { localizedPath, pathWithoutLang } from '$lib/i18n';
	import { chapterPositions, overviewNodes, positionLabel, sharedParts } from '$lib/kernel/kernel-overview';
	import { readerLang } from '$lib/lang.svelte';

	let { href }: { href: string } = $props();
	const lang = $derived(readerLang());
	// Positions are keyed by the shared path, so both languages show the same marker.
	const current = $derived(chapterPositions[pathWithoutLang(href)] ?? []);
	// The data-flow order of the overview figure, so the strip reads like the figure.
	const strip = ['host', 'registry', 'plugin-check', 'run', 'run-document', 'lang-tools', 'context', 'lang-core', 'facet', 'output', 'project', 'typecheck'];
	const nodes = strip.map((id) => overviewNodes.find((node) => node.id === id)!);
</script>

{#if current.length}
	<nav class="position" aria-label="全体の構成でのこの章の位置">
		<p><span>全体の構成での位置：</span><strong>{current.map(positionLabel).join('、')}</strong><a href={localizedPath('/learn/kernel#overview', lang)}>全体の構成の図へ戻る</a></p>
		<ol aria-label="カーネルと言語プラグインの部分">
			{#each nodes as node (node.id)}<li><a href={localizedPath(node.href, lang)} class:current={current.includes(node.id)} aria-current={current.includes(node.id) ? 'location' : undefined}>{node.label}</a></li>{/each}
		</ol>
		<ol class="parts" aria-label="どの処理も使う共通部品">
			{#each sharedParts as part (part.id)}<li><a href={localizedPath(part.href, lang)} class:current={current.includes(`part:${part.id}`)} aria-current={current.includes(`part:${part.id}`) ? 'location' : undefined}>{part.label}</a></li>{/each}
		</ol>
	</nav>
{/if}

<style>
	.position { margin-top: 22px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); font-size: 12px; }
	p { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; color: var(--muted); }
	strong { color: var(--fg); font-weight: 600; }
	p a { margin-left: auto; color: var(--accent); }
	p a:hover { text-decoration: underline; }
	ol { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; list-style: none; }
	ol a { display: block; padding: 2px 8px; border: 1px solid var(--border); border-radius: 3px; color: var(--muted); font-size: 11px; background: var(--raised); }
	ol a:hover { color: var(--fg); border-color: var(--border-strong); }
	.parts a { border-style: dashed; }
	ol a.current { border: 1px solid var(--accent); background: var(--accent-wash); color: var(--fg); font-weight: 600; }
	a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
