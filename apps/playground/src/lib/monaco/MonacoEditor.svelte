<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import loader from '@monaco-editor/loader';
	import type * as Monaco from 'monaco-editor';
	import {
		registerSvelteLanguage,
		SVELTE_LANGUAGE_ID,
		SVELTE_THEME_LIGHT,
		SVELTE_THEME_DARK
	} from './svelte-language';
	import { themeStore } from '$lib/theme.svelte';

	interface Props {
		value: string;
		language?: string;
		readonly?: boolean;
		highlightRange?: { start: number; end: number } | null;
		onchange?: (value: string) => void;
		onCursorPositionChange?: (offset: number) => void;
	}

	let {
		value = $bindable(),
		language = SVELTE_LANGUAGE_ID,
		readonly = false,
		highlightRange = null,
		onchange,
		onCursorPositionChange
	}: Props = $props();

	let container: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco | null = null;
	let isUpdatingFromProp = false;
	let decorationIds: string[] = [];

	onMount(async () => {
		monaco = await loader.init();

		// Register Svelte language and theme
		registerSvelteLanguage(monaco);

		editor = monaco.editor.create(container, {
			value,
			language,
			theme: themeStore.current === 'dark' ? SVELTE_THEME_DARK : SVELTE_THEME_LIGHT,
			readOnly: readonly,
			automaticLayout: true,
			minimap: { enabled: false },
			fontSize: 14,
			fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, monospace",
			lineNumbers: 'on',
			lineHeight: 22,
			padding: { top: 16 },
			scrollBeyondLastLine: false,
			wordWrap: 'on',
			tabSize: 2,
			insertSpaces: false,
			renderWhitespace: 'selection',
			cursorBlinking: 'smooth',
			cursorSmoothCaretAnimation: 'on',
			smoothScrolling: true,
			bracketPairColorization: { enabled: true },
			guides: {
				bracketPairs: true,
				indentation: true
			},
			folding: true,
			foldingStrategy: 'indentation',
			suggest: {
				showKeywords: true,
				showSnippets: true
			},
			quickSuggestions: true,
			parameterHints: { enabled: true },
			formatOnPaste: true,
			formatOnType: true
		});

		// Listen for content changes
		editor.onDidChangeModelContent(() => {
			if (!isUpdatingFromProp && editor) {
				const newValue = editor.getValue();
				value = newValue;
				onchange?.(newValue);
			}
		});

		// Listen for cursor position changes
		editor.onDidChangeCursorPosition((e) => {
			if (editor && onCursorPositionChange) {
				const model = editor.getModel();
				if (model) {
					const offset = model.getOffsetAt(e.position);
					onCursorPositionChange(offset);
				}
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			try {
				editor.dispose();
			} catch {
				// Ignore dispose errors during hot reload or key-based remount
			}
		}
	});

	// Update editor when value changes from outside
	$effect(() => {
		if (editor && value !== editor.getValue()) {
			isUpdatingFromProp = true;
			editor.setValue(value);
			isUpdatingFromProp = false;
		}
	});

	// Update language when it changes
	$effect(() => {
		if (editor && monaco) {
			const model = editor.getModel();
			if (model) {
				monaco.editor.setModelLanguage(model, language);
			}
		}
	});

	// Update readonly state
	$effect(() => {
		if (editor) {
			editor.updateOptions({ readOnly: readonly });
		}
	});

	// React to global theme changes — flip Monaco's theme to match.
	$effect(() => {
		const next = themeStore.current === 'dark' ? SVELTE_THEME_DARK : SVELTE_THEME_LIGHT;
		if (monaco) monaco.editor.setTheme(next);
	});

	// Update highlight range
	$effect(() => {
		if (editor && monaco) {
			const model = editor.getModel();
			if (!model) return;

			// Clear previous decorations
			decorationIds = editor.deltaDecorations(decorationIds, []);

			if (highlightRange) {
				const startPos = model.getPositionAt(highlightRange.start);
				const endPos = model.getPositionAt(highlightRange.end);

				decorationIds = editor.deltaDecorations(
					[],
					[
						{
							range: new monaco.Range(
								startPos.lineNumber,
								startPos.column,
								endPos.lineNumber,
								endPos.column
							),
							options: {
								className: 'highlighted-range',
								inlineClassName: 'highlighted-range-inline'
							}
						}
					]
				);

				// Scroll to the highlighted range
				editor.revealRangeInCenter(
					new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column)
				);
			}
		}
	});
</script>

<div class="editor-container" bind:this={container}></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
	}

	:global(.highlighted-range) {
		background-color: rgba(255, 62, 0, 0.14) !important;
		border-bottom: 1px solid rgba(255, 62, 0, 0.55);
	}

	:global(.highlighted-range-inline) {
		background-color: rgba(255, 62, 0, 0.22) !important;
	}
</style>
