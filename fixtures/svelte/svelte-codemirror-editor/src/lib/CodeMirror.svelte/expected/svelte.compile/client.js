import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><div class="scm-waiting__loading scm-loading svelte-11pi7t"><div class="scm-loading__spinner svelte-11pi7t"></div> <p class="scm-loading__text svelte-11pi7t">Loading editor...</p></div> <pre class="scm-pre cm-editor svelte-11pi7t"> </pre></div>`);

export default function CodeMirror($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		extensions = $.prop($$props, 'extensions', 19, () => []),
		keybindings = $.prop($$props, 'keybindings', 19, () => []),
		allowMultiSelect = $.prop($$props, 'allowMultiSelect', 3, true),
		useTab = $.prop($$props, 'useTab', 3, true),
		tabSize = $.prop($$props, 'tabSize', 3, 2),
		lineWrapping = $.prop($$props, 'lineWrapping', 3, false),
		lineNumbers = $.prop($$props, 'lineNumbers', 3, true),
		highlight = $.prop($$props, 'highlight', 19, () => ({
			activeLine: true,
			activeLineGutter: true,
			specialChars: true,
			selectionMatches: true
		})),
		history = $.prop($$props, 'history', 3, true),
		foldGutter = $.prop($$props, 'foldGutter', 3, true),
		drawSelection = $.prop($$props, 'drawSelection', 3, true),
		dropCursor = $.prop($$props, 'dropCursor', 3, true),
		indentOnInput = $.prop($$props, 'indentOnInput', 3, true),
		syntaxHighlighting = $.prop($$props, 'syntaxHighlighting', 3, true),
		bracketMatching = $.prop($$props, 'bracketMatching', 3, true),
		closeBrackets = $.prop($$props, 'closeBrackets', 3, true),
		autocompletion = $.prop($$props, 'autocompletion', 3, true),
		rectangularSelection = $.prop($$props, 'rectangularSelection', 3, true),
		crosshairCursor = $.prop($$props, 'crosshairCursor', 3, true),
		editable = $.prop($$props, 'editable', 3, true),
		readonly = $.prop($$props, 'readonly', 3, false),
		nodebounce = $.prop($$props, 'nodebounce', 3, false),
		classes = $.prop($$props, 'class', 3, "");

	const is_browser = typeof window !== "undefined";
	let element = $.state(void 0);
	let view = $.state(void 0);
	let update_from_prop = $.state(false);
	let update_from_state = $.state(false);
	let first_config = $.state(true);
	let first_update = $.state(true);
	let state_extensions = $.derived(() => [...get_base_extensions(), ...get_theme(), ...extensions()]);

	$.user_effect(() => {
		//eslint-disable-next-line @typescript-eslint/no-unused-expressions
		value();

		if ($.get(view)) untrack(() => update(value()));
	});

	$.user_effect(() => {
		if ($.get(view) && $.get(state_extensions)) untrack(reconfigure);
	});

	let on_change = $.derived(() => nodebounce() ? handle_change : debounce(handle_change, 300));

	onMount(() => {
		$.set(view, create_editor_view(), true);
		$$props.onready?.($.get(view));
	});

	onDestroy(() => $.get(view)?.destroy());

	function create_editor_view() {
		return new EditorView({
			parent: $.get(element),
			state: create_editor_state(value()),
			dispatch(transaction) {
				if (!$.get(view)) return;

				$.get(view).update([transaction]);

				if (!$.get(update_from_prop) && transaction.docChanged) {
					$.get(on_change)();
				}
			}
		});
	}

	function reconfigure() {
		if ($.get(first_config)) {
			$.set(first_config, false);

			return;
		}

		if ($.get(view)) {
			$.get(view).dispatch({ effects: StateEffect.reconfigure.of($.get(state_extensions)) });
			$$props.onreconfigure?.($.get(view));
		}
	}

	function update(value) {
		if ($.get(first_update)) {
			$.set(first_update, false);

			return;
		}

		if ($.get(update_from_state)) {
			$.set(update_from_state, false);

			return;
		}

		$.set(update_from_prop, true);
		$.get(view).setState(create_editor_state(value));
		$.set(update_from_prop, false);
	}

	function handle_change() {
		if ($.get(view)) {
			const new_value = $.get(view).state.doc.toString();

			if (new_value === value()) return;

			$.set(update_from_state, true);
			value(new_value);
			$$props.onchange?.(value());
		}
	}

	function create_editor_state(value) {
		return EditorState.create({ doc: value ?? undefined, extensions: $.get(state_extensions) });
	}

	function get_base_extensions() {
		const extensions = [
			indentUnit.of((" ").repeat(tabSize())),
			EditorView.editable.of(editable()),
			EditorState.readOnly.of(readonly()),
			EditorState.allowMultipleSelections.of(allowMultiSelect())
		];

		const key_bindings = [
			...keybindings(),
			...defaultKeymap,
			...searchKeymap,
			...lintKeymap
		];

		if (useTab()) key_bindings.push(indentWithTab);
		if (lineNumbers()) extensions.push(lineNumbersExt(lineNumbers() === true ? undefined : lineNumbers()));
		if (highlight().activeLine) extensions.push(highlightActiveLine());
		if (highlight().activeLineGutter) extensions.push(highlightActiveLineGutter());
		if (dropCursor()) extensions.push(dropCursorExt());
		if (indentOnInput()) extensions.push(indentOnInputExt());
		if ($$props.placeholder) extensions.push(placeholderExt($$props.placeholder));
		if ($$props.lang) extensions.push($$props.lang);
		if (lineWrapping()) extensions.push(EditorView.lineWrapping);

		if (highlight().specialChars) {
			extensions.push(highlightSpecialChars(highlight().specialChars === true ? undefined : highlight().specialChars));
		}

		if (highlight().selectionMatches) {
			extensions.push(highlightSelectionMatches(highlight().selectionMatches === true ? undefined : highlight().selectionMatches));
		}

		if (history()) {
			extensions.push(history() === true ? historyExt() : historyExt(history()));
			key_bindings.push(...historyKeymap);
		}

		if (foldGutter()) {
			extensions.push(foldGutter() === true ? foldGutterExt() : foldGutterExt(foldGutter()));
			key_bindings.push(...foldKeymap);
		}

		if (drawSelection()) {
			extensions.push(drawSelection() === true
				? drawSelectionExt()
				: drawSelectionExt(drawSelection()));
		}

		if (syntaxHighlighting()) {
			if (syntaxHighlighting() === true) {
				extensions.push(syntaxHighlightingExt(defaultHighlightStyle, { fallback: true }));
			} else {
				const { highlighter = defaultHighlightStyle, fallback = true } = syntaxHighlighting();

				extensions.push(syntaxHighlightingExt(highlighter, { fallback }));
			}
		}

		if (bracketMatching()) {
			extensions.push(bracketMatchingExt(bracketMatching() === true ? undefined : bracketMatching()));
		}

		if (closeBrackets()) {
			extensions.push(closeBracketsExt());
			key_bindings.push(...closeBracketsKeymap);
		}

		if (autocompletion()) {
			extensions.push(autocompletionExt(autocompletion() === true ? undefined : autocompletion()));
			key_bindings.push(...completionKeymap);
		}

		if (rectangularSelection()) {
			extensions.push(rectangularSelectionExt(rectangularSelection() === true ? undefined : rectangularSelection()));
		}

		if (crosshairCursor()) {
			extensions.push(crosshairCursorExt(crosshairCursor() === true ? undefined : crosshairCursor()));
		}

		extensions.push(keymap.of(key_bindings));

		return extensions;
	}

	function get_theme() {
		const extensions = [];

		if ($$props.styles) extensions.push(EditorView.theme($$props.styles));
		if ($$props.theme) extensions.push($$props.theme);

		return extensions;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));
			$.template_effect(() => $.set_class(div, 1, $.clsx(["codemirror-wrapper", classes()]), 'svelte-11pi7t'));
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();
			var pre = $.sibling($.child(div_1), 2);
			var text = $.only_child(pre, true);

			$.reset(div_1);

			$.template_effect(() => {
				$.set_class(div_1, 1, $.clsx(["scm-waiting", classes()]), 'svelte-11pi7t');
				$.set_text(text, value());
			});

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (is_browser) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}