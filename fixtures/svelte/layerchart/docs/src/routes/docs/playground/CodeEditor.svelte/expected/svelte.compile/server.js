import * as $ from 'svelte/internal/server';
import { onMount, onDestroy } from 'svelte';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { EditorState, Compartment } from '@codemirror/state';
import { getSettings } from 'svelte-ux';

export default function CodeEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { value = '', filename = '', oninput = () => {} } = $$props;
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
			console.log({
				$currentTheme: $.store_get($$store_subs ??= {}, '$currentTheme', currentTheme)
			});

			return $.store_get($$store_subs ??= {}, '$currentTheme', currentTheme).dark ? githubDark : githubLight;

			// return githubDark;
		}

		onMount(() => {
			const startState = EditorState.create({
				doc: value,
				extensions: [
					basicSetup,
					languageCompartment.of(getLanguageExtension(filename)),
					themeCompartment.of(getCurrentTheme()),
					EditorView.updateListener.of((update) => {
						if (update.docChanged && !updating) {
							const newValue = update.state.doc.toString();

							value = newValue;
							oninput(newValue);
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
		// Reconfigure language when filename changes
		// Reconfigure theme when mode changes
		// Access $currentTheme to create reactive dependency
		onDestroy(() => {
			if (editorView) {
				editorView.destroy();
			}
		});

		$$renderer.push(`<div class="h-full"></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { value });
	});
}