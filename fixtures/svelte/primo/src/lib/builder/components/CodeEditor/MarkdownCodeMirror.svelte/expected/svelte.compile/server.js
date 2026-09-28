import * as $ from 'svelte/internal/server';
import { createEventDispatcher, onMount } from 'svelte';
import { basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { indentWithTab } from '@codemirror/commands';
import { vsCodeDark } from './theme';

export default function MarkdownCodeMirror($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		let {
			value = '',
			autofocus = false,
			placeholder = '',
			$$slots,
			$$events,
			...rest
		} = $$props;

		let container = null;
		let view = null;
		const placeholderCompartment = new Compartment();

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				const docValue = update.state.doc.toString();

				if (docValue !== value) {
					value = docValue;
					dispatch('change', { value: docValue });
				}
			}
		});

		function createExtensions() {
			const saveShortcut = {
				key: 'Mod-s',
				run: () => {
					dispatch('save', undefined);

					return true;
				}
			};

			return [
				basicSetup,
				EditorView.lineWrapping,
				markdown(),
				keymap.of([saveShortcut, indentWithTab]),
				updateListener,
				placeholderCompartment.of(placeholder ? cmPlaceholder(placeholder) : []),
				...vsCodeDark
			];
		}

		onMount(() => {
			if (!container) return;

			const state = EditorState.create({ doc: value ?? '', extensions: createExtensions() });

			view = new EditorView({ state, parent: container });

			if (autofocus) {
				queueMicrotask(() => view?.focus());
			}

			return () => {
				view?.destroy();
				view = null;
			};
		});

		$$renderer.push(`<div${$.attributes({ class: 'MarkdownCodeMirror overflow-auto', ...rest }, 'svelte-vqhry')}></div>`);
		$.bind_props($$props, { value });
	});
}