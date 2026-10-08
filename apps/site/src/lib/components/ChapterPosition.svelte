<script lang="ts">
	import { bilingual, localizedPath, pathWithoutLang } from '$lib/i18n';
	import { chapterPositions, overviewNodes, positionLabel, sharedParts } from '$lib/kernel/kernel-overview';
	import { readerLang } from '$lib/lang.svelte';

	let { href }: { href: string } = $props();
	const text = bilingual(
		{ position: '全体の構成でのこの章の位置', label: '全体の構成での位置：', separator: '、', back: '全体の構成の図へ戻る', nodes: 'カーネルと言語プラグインの部分', parts: 'どの処理も使う共通部品' },
		{ position: 'Where this chapter sits in the overview', label: 'Position in the overview:', separator: ', ', back: 'Back to the overview figure', nodes: 'Parts of the kernel and the language plugins', parts: 'Shared parts that every task uses' }
	);
	const lang = $derived(readerLang());
	const t = $derived(text[lang]);
	// Positions are keyed by the shared path, so both languages show the same marker.
	const current = $derived(chapterPositions[pathWithoutLang(href)] ?? []);
	// The data-flow order of the overview figure, so the strip reads like the figure.
	const strip = ['host', 'registry', 'plugin-check', 'run', 'run-document', 'lang-tools', 'context', 'lang-core', 'facet', 'output', 'project', 'typecheck'];
	const nodes = strip.map((id) => overviewNodes.find((node) => node.id === id)!);
</script>

{#if current.length}
	<nav class="position" aria-label={t.position}>
		<p><span>{t.label}</span><strong>{current.map((id) => positionLabel(id, lang)).join(t.separator)}</strong><a href={localizedPath('/learn/kernel#overview', lang)}>{t.back}</a></p>
		<ol aria-label={t.nodes}>
			{#each nodes as node (node.id)}<li><a href={localizedPath(node.href, lang)} class:current={current.includes(node.id)} aria-current={current.includes(node.id) ? 'location' : undefined}>{node.label[lang]}</a></li>{/each}
		</ol>
		<ol class="parts" aria-label={t.parts}>
			{#each sharedParts as part (part.id)}<li><a href={localizedPath(part.href, lang)} class:current={current.includes(`part:${part.id}`)} aria-current={current.includes(`part:${part.id}`) ? 'location' : undefined}>{part.label[lang]}</a></li>{/each}
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
