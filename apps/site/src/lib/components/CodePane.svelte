<script lang="ts">
	import { onMount } from 'svelte';
	import type { ThemedToken } from 'shiki/core';
	import type { CodeLanguage } from '$lib/kernel/code-language';
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	let { value = $bindable(''), language, label, editable = false, hint }: {
		value: string; language: CodeLanguage; label: string; editable?: boolean;
		/** The id of an element that explains the editor's keys. */
		hint?: string;
	} = $props();
	const text = bilingual(
		{ load: '色分けを読み込めませんでした。ソースはそのまま表示します。', paint: '色分けできませんでした。ソースはそのまま表示します。' },
		{ load: 'Could not load syntax colors. The source is shown without them.', paint: 'Could not color the source. It is shown without colors.' }
	);
	let tokenizer = $state<typeof import('$lib/kernel/highlight').highlight>();
	let tokens = $state<ThemedToken[][]>([]);
	let paintedSource = $state<string | null>(null);
	let paintedLanguage = $state<CodeLanguage>();
	let error = $state('');
	let highlighted = $state<HTMLPreElement>();
	let scrollTop = $state(0);
	const painted = $derived(paintedSource === value && paintedLanguage === language);
	const lines = $derived(value.split('\n'));

	onMount(() => {
		let disposed = false;
		import('$lib/kernel/highlight').then((module) => {
			if (!disposed) tokenizer = module.highlight;
		}).catch(() => { if (!disposed) error = text[readerLang()].load; });
		return () => { disposed = true; };
	});
	$effect(() => {
		const source = value;
		const lang = language;
		const tokenize = tokenizer;
		let disposed = false;
		if (tokenize) {
			void tokenize(source, lang).then((result) => {
				if (disposed) return;
				tokens = result;
				paintedSource = source;
				paintedLanguage = lang;
				error = '';
			}).catch(() => {
				if (!disposed) error = text[readerLang()].paint;
			});
		}
		return () => { disposed = true; };
	});
	function scroll(event: Event) {
		const input = event.currentTarget as HTMLTextAreaElement;
		scrollTop = input.scrollTop;
		if (highlighted) {
			highlighted.scrollTop = input.scrollTop;
			highlighted.scrollLeft = input.scrollLeft;
		}
	}
	let editor = $state<HTMLTextAreaElement>();
	// After Escape, Tab moves focus out of the editor instead of indenting, so keyboard users are not trapped.
	let released = false;
	/** Moves the caret to a one-based line and column and focuses the editor. */
	export function select(line: number, column: number) {
		if (!editor) return;
		const starts = [0];
		for (let i = 0; i < value.length; i++) if (value[i] === '\n') starts.push(i + 1);
		const start = starts[Math.min(Math.max(line, 1), starts.length) - 1];
		const end = line < starts.length ? starts[line] - 1 : value.length;
		const offset = Math.min(start + Math.max(column, 1) - 1, end);
		editor.focus();
		editor.setSelectionRange(offset, offset);
		const lineHeight = parseFloat(getComputedStyle(editor).lineHeight);
		editor.scrollTop = Math.max(0, (line - 3) * lineHeight);
	}
	function indent(event: KeyboardEvent) {
		if (event.key === 'Escape') { released = true; return; }
		const release = released;
		released = false;
		if (event.key !== 'Tab' || release || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
		event.preventDefault();
		const input = event.currentTarget as HTMLTextAreaElement;
		input.setRangeText('  ', input.selectionStart, input.selectionEnd, 'end');
		value = input.value;
	}
</script>

{#snippet coloredLines()}
	{#each tokens as line, index (index)}<span class="code-line">{#each line as token, i (i)}<span style:color={token.color}>{token.content}</span>{/each}{index < tokens.length - 1 ? '\n' : ''}</span>{/each}
{/snippet}

<div class="code-pane" class:editable data-highlighted={painted}>
	{#if editable}
		<div class="gutter" aria-hidden="true"><div style:transform="translateY({-scrollTop}px)">{#each lines as _, index (index)}<span>{index + 1}</span>{/each}</div></div>
		<div class="editor">
			<pre class="paint" bind:this={highlighted} aria-hidden="true"><code>{#if painted}{@render coloredLines()}{/if}{value.endsWith('\n') ? ' ' : ''}</code></pre>
			<textarea bind:this={editor} aria-label={label} aria-describedby={hint} bind:value spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" class:painted onscroll={scroll} onkeydown={indent}></textarea>
		</div>
	{:else}
		<div class="read-only" role="textbox" aria-readonly="true" aria-multiline="true" aria-label={label} tabindex="0"><pre><code>{#if painted}{#each tokens as line, index (index)}<span class="output-line"><span class="line-number" aria-hidden="true">{index + 1}</span>{#each line as token, i (i)}<span style:color={token.color}>{token.content}</span>{/each}{index < tokens.length - 1 ? '\n' : ''}</span>{/each}{:else}{#each lines as line, index (index)}<span class="output-line"><span class="line-number" aria-hidden="true">{index + 1}</span>{line}{index < lines.length - 1 ? '\n' : ''}</span>{/each}{/if}</code></pre></div>
	{/if}
	{#if error}<span class="highlight-error" role="status">{error}</span>{/if}
</div>

<style>
	.code-pane { position: relative; height: 100%; min-height: 0; min-width: 0; background: var(--raised); }
	.editable { display: flex; }
	pre, textarea, .gutter { margin: 0; font: 13px/23px var(--font-mono, monospace); font-variant-ligatures: none; tab-size: 2; letter-spacing: 0; }
	pre, textarea { padding: 18px 16px; border: 0; border-radius: 0; white-space: pre; }
	code { font: inherit; }
	.gutter { width: 48px; flex-shrink: 0; padding: 18px 0; overflow: hidden; text-align: right; color: var(--muted); user-select: none; }
	.gutter span { display: block; padding-right: 13px; }
	.editor { position: relative; min-width: 0; flex: 1; }
	.editor pre, textarea { position: absolute; inset: 0; width: 100%; height: 100%; }
	.paint { overflow: hidden; pointer-events: none; }
	textarea { resize: none; background: transparent; color: var(--fg-2); caret-color: var(--fg); outline: none; }
	textarea.painted { color: transparent; -webkit-text-fill-color: transparent; }
	textarea::selection { background: var(--accent-wash); }
	.editor:focus-within { box-shadow: inset 0 0 0 1px var(--border-strong); }
	.read-only { height: 100%; overflow: auto; color: var(--fg-2); }
	.read-only:focus-visible { outline: 1px solid var(--border-strong); outline-offset: -1px; }
	.line-number { display: inline-block; min-width: 3ch; margin-right: 22px; text-align: right; color: var(--muted); user-select: none; }
	.highlight-error { position: absolute; bottom: 0; inset-inline: 0; background: var(--surface); color: var(--muted); padding: 6px 12px; font-size: 11px; }
</style>
