<script lang="ts">
	import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
	import { css } from '@codemirror/lang-css';
	import { javascript } from '@codemirror/lang-javascript';
	import { bracketMatching, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { setDiagnostics, type Diagnostic } from '@codemirror/lint';
	import { EditorState, type Extension, type Text } from '@codemirror/state';
	import { drawSelection, EditorView, keymap, lineNumbers } from '@codemirror/view';
	import { tags } from '@lezer/highlight';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { untrack } from 'svelte';
	import type { Problem } from '#lib/playground.ts';

	let {
		value = $bindable(),
		file,
		label,
		readonly = false,
		problems = [],
	}: {
		value: string;
		file: string;
		label: string;
		readonly?: boolean;
		problems?: Problem[];
	} = $props();

	// The colors are CSS variables in app.css, so the light and dark themes both apply.
	const highlight = HighlightStyle.define([
		{ tag: [tags.keyword, tags.operatorKeyword, tags.modifier], color: 'var(--code-keyword)' },
		{ tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--code-string)' },
		{ tag: [tags.number, tags.bool, tags.null, tags.atom], color: 'var(--code-number)' },
		{ tag: [tags.comment, tags.meta], color: 'var(--code-comment)', fontStyle: 'italic' },
		{ tag: [tags.tagName, tags.angleBracket], color: 'var(--code-tag)' },
		{ tag: [tags.attributeName, tags.propertyName], color: 'var(--code-attribute)' },
		{
			tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
			color: 'var(--code-function)',
		},
		{
			tag: [tags.typeName, tags.className, tags.special(tags.variableName)],
			color: 'var(--code-type)',
		},
	]);

	// A step names its output by its kind (`js`, `css`), and a source by its file name.
	function language(name: string): Extension {
		const extension = name.split('.').at(-1);
		if (extension === 'svelte') return svelte();
		if (extension === 'css') return css();
		if (extension === 'js') return javascript();
		return [];
	}

	const theme = EditorView.theme({
		'&': { height: '100%', background: 'var(--code-bg)', borderRadius: '8px' },
		'&.cm-focused': { outline: '2px solid var(--line)' },
		'.cm-scroller': {
			fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
			fontSize: '0.9em',
			lineHeight: '1.55',
		},
		'.cm-content': { padding: '0.9rem 0', caretColor: 'var(--fg)' },
		'.cm-gutters': { background: 'transparent', border: 'none', color: 'var(--muted)' },
		'.cm-cursor': { borderLeftColor: 'var(--fg)' },
		'.cm-tooltip': {
			border: '1px solid var(--line)',
			borderRadius: '6px',
			color: 'var(--fg)',
			background: 'var(--bg)',
		},
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
			background: 'var(--selection) !important',
		},
	});

	// State, so the effects below run again once the editor exists.
	let view: EditorView | undefined = $state.raw();

	// An attachment runs again when what it reads changes; the editor is created once.
	const mount = (node: HTMLElement) => untrack(() => create(node));

	function create(node: HTMLElement) {
		view = new EditorView({
			parent: node,
			state: EditorState.create({
				doc: value,
				extensions: [
					lineNumbers(),
					drawSelection(),
					bracketMatching(),
					syntaxHighlighting(highlight),
					theme,
					language(file),
					EditorState.tabSize.of(2),
					EditorView.contentAttributes.of({ 'aria-label': label }),
					readonly
						? [EditorState.readOnly.of(true), EditorView.editable.of(false)]
						: [
								history(),
								keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
								EditorView.updateListener.of((update) => {
									if (update.docChanged) value = update.state.doc.toString();
								}),
							],
				],
			}),
		});
		return () => view?.destroy();
	}

	// A 1-based line and column, clamped to the document.
	function offset(doc: Text, { line, column }: { line: number; column: number }) {
		if (line > doc.lines) return doc.length;
		const { from, to } = doc.line(Math.max(line, 1));
		return Math.min(from + column - 1, to);
	}

	$effect(() => {
		if (!view) return;
		const doc = view.state.doc;
		const marks: Diagnostic[] = problems.map((problem) => {
			const from = offset(doc, problem.start);
			return {
				from,
				to: Math.max(from, offset(doc, problem.end)),
				severity: problem.severity,
				message: problem.message,
				source: problem.rule ?? undefined,
			};
		});
		view.dispatch(setDiagnostics(view.state, marks));
	});

	// Output changes from outside; the editor's own typing already matches `value`.
	$effect(() => {
		const next = value;
		if (view && next !== view.state.doc.toString())
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
	});
</script>

<div class="code" {@attach mount}></div>

<style>
	.code {
		height: 100%;
		min-height: 0;
		overflow: hidden;
		border-radius: 8px;
	}
</style>
