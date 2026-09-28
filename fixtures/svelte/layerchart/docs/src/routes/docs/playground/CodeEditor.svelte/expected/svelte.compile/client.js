import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from 'svelte';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { EditorState, Compartment } from '@codemirror/state';
import { getSettings } from 'svelte-ux';

var root = $.from_html(`<div class="h-full"></div>`);

export default function CodeEditor($$anchor, $$props) {
	$.push($$props, true);

	const $currentTheme = () => $.store_get(currentTheme, '$currentTheme', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let value = $.prop($$props, 'value', 15, ''),
		filename = $.prop($$props, 'filename', 3, ''),
		oninput = $.prop($$props, 'oninput', 3, () => {});

	let editorContainer;
	let editorView = null;
	let updating = false;

	// Use Compartments for reconfigurable extensions
	const languageCompartment = new Compartment();

	const themeCompartment = new Compartment();

	// Get current theme mode from svelte-ux settings
	const { currentTheme } = getSettings();

	// Determine language based on file extension
	function getLanguageExtension(filename) {
		if (filename.endsWith('.svelte') || filename.endsWith('.html')) {
			return html();
		} else if (filename.endsWith('.ts') || filename.endsWith('.js')) {
			return javascript({ typescript: filename.endsWith('.ts') });
		} else if (filename.endsWith('.css')) {
			return css();
		}

		return javascript();
	}

	// Get theme based on current mode
	function getCurrentTheme() {
		// TODO: read from
		console.log({ $currentTheme: $currentTheme() });

		return $currentTheme().dark ? githubDark : githubLight;

		// return githubDark;
	}

	onMount(() => {
		const startState = EditorState.create({
			doc: value(),
			extensions: [
				basicSetup,
				languageCompartment.of(getLanguageExtension(filename())),
				themeCompartment.of(getCurrentTheme()),
				EditorView.updateListener.of((update) => {
					if (update.docChanged && !updating) {
						const newValue = update.state.doc.toString();

						value(newValue);
						oninput()(newValue);
					}
				}),

				EditorView.theme({
					'&': { height: '100%', background: 'var(--color-surface-100)' },
					'.cm-scroller': { overflow: 'auto' },
					'.cm-gutters': {
						backgroundColor: 'var(--color-surface-300)',
						color: 'var(--color-surface-content)',
						border: 'none'
					}
				})
			]
		});

		editorView = new EditorView({ state: startState, parent: editorContainer });
	});

	// Update editor when value changes externally
	$.user_effect(() => {
		if (editorView && value() !== editorView.state.doc.toString()) {
			updating = true;

			editorView.dispatch({
				changes: { from: 0, to: editorView.state.doc.length, insert: value() }
			});

			updating = false;
		}
	});

	// Reconfigure language when filename changes
	$.user_effect(() => {
		if (editorView && filename()) {
			editorView.dispatch({
				effects: languageCompartment.reconfigure(getLanguageExtension(filename()))
			});
		}
	});

	// Reconfigure theme when mode changes
	$.user_effect(() => {
		if (editorView) {
			// Access $currentTheme to create reactive dependency
			const theme = $currentTheme();

			editorView.dispatch({ effects: themeCompartment.reconfigure(getCurrentTheme()) });
		}
	});

	onDestroy(() => {
		if (editorView) {
			editorView.destroy();
		}
	});

	var div = root();

	$.bind_this(div, ($$value) => editorContainer = $$value, () => editorContainer);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}