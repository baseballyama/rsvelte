import * as $ from 'svelte/internal/server';
import { onDestroy, onMount, untrack } from "svelte";
import { debounce } from "./util";

import {
	autocompletion as autocompletionExt,
	closeBrackets as closeBracketsExt,
	closeBracketsKeymap,
	completionKeymap
} from "@codemirror/autocomplete";

import {
	defaultKeymap,
	history as historyExt,
	historyKeymap,
	indentWithTab
} from "@codemirror/commands";

import {
	bracketMatching as bracketMatchingExt,
	defaultHighlightStyle,
	foldGutter as foldGutterExt,
	foldKeymap,
	indentOnInput as indentOnInputExt,
	indentUnit,
	syntaxHighlighting as syntaxHighlightingExt
} from "@codemirror/language";

import { lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState, StateEffect } from "@codemirror/state";

import {
	crosshairCursor as crosshairCursorExt,
	drawSelection as drawSelectionExt,
	dropCursor as dropCursorExt,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	highlightSpecialChars,
	keymap,
	lineNumbers as lineNumbersExt,
	placeholder as placeholderExt,
	rectangularSelection as rectangularSelectionExt
} from "@codemirror/view";

export default function CodeMirror($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			lang,
			theme,
			extensions = [],
			keybindings = [],
			allowMultiSelect = true,
			useTab = true,
			tabSize = 2,
			lineWrapping = false,
			lineNumbers = true,
			highlight = {
				activeLine: true,
				activeLineGutter: true,
				specialChars: true,
				selectionMatches: true
			},
			history = true,
			foldGutter = true,
			drawSelection = true,
			dropCursor = true,
			indentOnInput = true,
			syntaxHighlighting = true,
			bracketMatching = true,
			closeBrackets = true,
			autocompletion = true,
			rectangularSelection = true,
			crosshairCursor = true,
			styles,
			editable = true,
			readonly = false,
			placeholder,
			nodebounce = false,
			class: classes = "",
			onchange,
			onready,
			onreconfigure
		} = $$props;

		const is_browser = typeof window !== "undefined";
		let element = void 0;
		let view = void 0;
		let update_from_prop = false;
		let update_from_state = false;
		let first_config = true;
		let first_update = true;
		let state_extensions = $.derived(() => [...get_base_extensions(), ...get_theme(), ...extensions]);

		//eslint-disable-next-line @typescript-eslint/no-unused-expressions
		let on_change = $.derived(() => nodebounce ? handle_change : debounce(handle_change, 300));

		onMount(() => {
			view = create_editor_view();
			onready?.(view);
		});

		onDestroy(() => view?.destroy());

		function create_editor_view() {
			return new EditorView({
				parent: element,
				state: create_editor_state(value),
				dispatch(transaction) {
					if (!view) return;

					view.update([transaction]);

					if (!update_from_prop && transaction.docChanged) {
						on_change()();
					}
				}
			});
		}

		function reconfigure() {
			if (first_config) {
				first_config = false;

				return;
			}

			if (view) {
				view.dispatch({ effects: StateEffect.reconfigure.of(state_extensions()) });
				onreconfigure?.(view);
			}
		}

		function update(value) {
			if (first_update) {
				first_update = false;

				return;
			}

			if (update_from_state) {
				update_from_state = false;

				return;
			}

			update_from_prop = true;
			view.setState(create_editor_state(value));
			update_from_prop = false;
		}

		function handle_change() {
			if (view) {
				const new_value = view.state.doc.toString();

				if (new_value === value) return;

				update_from_state = true;
				value = new_value;
				onchange?.(value);
			}
		}

		function create_editor_state(value) {
			return EditorState.create({ doc: value ?? undefined, extensions: state_extensions() });
		}

		function get_base_extensions() {
			const extensions = [
				indentUnit.of((" ").repeat(tabSize)),
				EditorView.editable.of(editable),
				EditorState.readOnly.of(readonly),
				EditorState.allowMultipleSelections.of(allowMultiSelect)
			];

			const key_bindings = [
				...keybindings,
				...defaultKeymap,
				...searchKeymap,
				...lintKeymap
			];

			if (useTab) key_bindings.push(indentWithTab);
			if (lineNumbers) extensions.push(lineNumbersExt(lineNumbers === true ? undefined : lineNumbers));
			if (highlight.activeLine) extensions.push(highlightActiveLine());
			if (highlight.activeLineGutter) extensions.push(highlightActiveLineGutter());
			if (dropCursor) extensions.push(dropCursorExt());
			if (indentOnInput) extensions.push(indentOnInputExt());
			if (placeholder) extensions.push(placeholderExt(placeholder));
			if (lang) extensions.push(lang);
			if (lineWrapping) extensions.push(EditorView.lineWrapping);

			if (highlight.specialChars) {
				extensions.push(highlightSpecialChars(highlight.specialChars === true ? undefined : highlight.specialChars));
			}

			if (highlight.selectionMatches) {
				extensions.push(highlightSelectionMatches(highlight.selectionMatches === true ? undefined : highlight.selectionMatches));
			}

			if (history) {
				extensions.push(history === true ? historyExt() : historyExt(history));
				key_bindings.push(...historyKeymap);
			}

			if (foldGutter) {
				extensions.push(foldGutter === true ? foldGutterExt() : foldGutterExt(foldGutter));
				key_bindings.push(...foldKeymap);
			}

			if (drawSelection) {
				extensions.push(drawSelection === true ? drawSelectionExt() : drawSelectionExt(drawSelection));
			}

			if (syntaxHighlighting) {
				if (syntaxHighlighting === true) {
					extensions.push(syntaxHighlightingExt(defaultHighlightStyle, { fallback: true }));
				} else {
					const { highlighter = defaultHighlightStyle, fallback = true } = syntaxHighlighting;

					extensions.push(syntaxHighlightingExt(highlighter, { fallback }));
				}
			}

			if (bracketMatching) {
				extensions.push(bracketMatchingExt(bracketMatching === true ? undefined : bracketMatching));
			}

			if (closeBrackets) {
				extensions.push(closeBracketsExt());
				key_bindings.push(...closeBracketsKeymap);
			}

			if (autocompletion) {
				extensions.push(autocompletionExt(autocompletion === true ? undefined : autocompletion));
				key_bindings.push(...completionKeymap);
			}

			if (rectangularSelection) {
				extensions.push(rectangularSelectionExt(rectangularSelection === true ? undefined : rectangularSelection));
			}

			if (crosshairCursor) {
				extensions.push(crosshairCursorExt(crosshairCursor === true ? undefined : crosshairCursor));
			}

			extensions.push(keymap.of(key_bindings));

			return extensions;
		}

		function get_theme() {
			const extensions = [];

			if (styles) extensions.push(EditorView.theme(styles));
			if (theme) extensions.push(theme);

			return extensions;
		}

		if (is_browser) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(["codemirror-wrapper", classes]), 'svelte-11pi7t')}></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(["scm-waiting", classes]), 'svelte-11pi7t')}><div class="scm-waiting__loading scm-loading svelte-11pi7t"><div class="scm-loading__spinner svelte-11pi7t"></div> <p class="scm-loading__text svelte-11pi7t">Loading editor...</p></div> <pre class="scm-pre cm-editor svelte-11pi7t">${$.escape(value)}</pre></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { value });
	});
}