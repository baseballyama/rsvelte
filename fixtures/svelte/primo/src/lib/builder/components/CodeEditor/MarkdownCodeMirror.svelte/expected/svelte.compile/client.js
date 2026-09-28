import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher, onMount } from 'svelte';
import { basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { indentWithTab } from '@codemirror/commands';
import { vsCodeDark } from './theme';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'autofocus',
	'placeholder'
]);

var root = $.from_html(`<div></div>`);

export default function MarkdownCodeMirror($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	let value = $.prop($$props, 'value', 15, ''),
		autofocus = $.prop($$props, 'autofocus', 3, false),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	let container = null;
	let view = null;
	const placeholderCompartment = new Compartment();

	const updateListener = EditorView.updateListener.of((update) => {
		if (update.docChanged) {
			const docValue = update.state.doc.toString();

			if (docValue !== value()) {
				value(docValue);
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
			placeholderCompartment.of(placeholder() ? cmPlaceholder(placeholder()) : []),
			...vsCodeDark
		];
	}

	onMount(() => {
		if (!container) return;

		const state = EditorState.create({ doc: value() ?? '', extensions: createExtensions() });

		view = new EditorView({ state, parent: container });

		if (autofocus()) {
			queueMicrotask(() => view?.focus());
		}

		return () => {
			view?.destroy();
			view = null;
		};
	});

	var div = root();

	$.attribute_effect(div, () => ({ class: 'MarkdownCodeMirror overflow-auto', ...rest }), void 0, void 0, void 0, 'svelte-vqhry');
	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, div);
	$.pop();
}