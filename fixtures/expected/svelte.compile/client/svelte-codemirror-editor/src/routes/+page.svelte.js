import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeMirror from "$lib";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { cssValue, htmlValue, javascriptValue, typescriptValue } from "./_util/code";

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div class="demo svelte-1uha8ag"><!> <div class="props svelte-1uha8ag"><h5 class="svelte-1uha8ag">Basic setup</h5> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"/> <label for="basic" class="svelte-1uha8ag">Allow multi-select</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"/> <label for="editable" class="svelte-1uha8ag">Editable</label></div> <div class="toggle svelte-1uha8ag"><input id="readonly" type="checkbox"/> <label for="readonly" class="svelte-1uha8ag">Read-only</label></div> <div class="toggle svelte-1uha8ag"><input id="lineWrapping" type="checkbox"/> <label for="lineWrapping" class="svelte-1uha8ag">Line Wrapping</label></div> <div class="toggle svelte-1uha8ag"><input id="nodebounce" type="checkbox"/> <label for="nodebounce" class="svelte-1uha8ag">No debounce</label></div></div> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"/> <label for="basic" class="svelte-1uha8ag">Show line numbers</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"/> <label for="editable" class="svelte-1uha8ag">History</label></div> <div class="toggle svelte-1uha8ag"><input id="readonly" type="checkbox"/> <label for="readonly" class="svelte-1uha8ag">Fold Gutter</label></div> <div class="toggle svelte-1uha8ag"><input id="lineWrapping" type="checkbox"/> <label for="lineWrapping" class="svelte-1uha8ag">Draw Selection</label></div> <div class="toggle svelte-1uha8ag"><input id="nodebounce" type="checkbox"/> <label for="nodebounce" class="svelte-1uha8ag">Drop Cursor</label></div></div> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"/> <label for="basic" class="svelte-1uha8ag">Indent on Input</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"/> <label for="editable" class="svelte-1uha8ag">Syntax Highlighting</label></div> <div class="toggle svelte-1uha8ag"><input id="readonly" type="checkbox"/> <label for="readonly" class="svelte-1uha8ag">Bracket Matching</label></div> <div class="toggle svelte-1uha8ag"><input id="lineWrapping" type="checkbox"/> <label for="lineWrapping" class="svelte-1uha8ag">Close Brackets</label></div> <div class="toggle svelte-1uha8ag"><input id="nodebounce" type="checkbox"/> <label for="nodebounce" class="svelte-1uha8ag">Autocompletion</label></div></div> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"/> <label for="basic" class="svelte-1uha8ag">Rectangular Selection</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"/> <label for="editable" class="svelte-1uha8ag">Crosshair Cursor</label></div></div> <h5 class="svelte-1uha8ag">Tab</h5> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="useTab" type="checkbox"/> <label for="useTab" class="svelte-1uha8ag">Enable Tab</label></div> <div class="input svelte-1uha8ag"><label for="tabSize" class="svelte-1uha8ag">Tab size</label> <input id="tabSize" type="number" step="1" class="svelte-1uha8ag"/></div></div> <h5 class="svelte-1uha8ag">Language</h5> <div class="props-section svelte-1uha8ag"><div class="input svelte-1uha8ag"><label for="language" class="svelte-1uha8ag">Language</label> <select id="language"></select></div></div> <h5 class="svelte-1uha8ag">Theme</h5> <div class="props-section svelte-1uha8ag"><div class="input svelte-1uha8ag"><label for="theme" class="svelte-1uha8ag">Theme</label> <select id="theme"></select></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state("");

	let props = $.proxy({
		allowMultiSelect: true,
		useTab: true,
		editable: true,
		lineWrapping: false,
		lineNumbers: true,
		highlight: {
			activeLine: true,
			activeLineGutter: true,
			specialChars: true,
			selectionMatches: true
		},
		history: true,
		foldGutter: true,
		drawSelection: true,
		dropCursor: true,
		indentOnInput: true,
		syntaxHighlighting: true,
		bracketMatching: true,
		closeBrackets: true,
		autocompletion: true,
		rectangularSelection: true,
		crosshairCursor: true,
		readonly: false,
		tabSize: 2,
		placeholder: null,
		lang: null,
		theme: null,
		nodebounce: false
	});

	const languages = ["custom", "javascript", "typescript", "css", "html"];
	let language = $.state("custom");
	const themes = ["default", "onedark"];
	let theme = $.state("default");

	function on_language_change() {
		switch ($.get(language)) {
			case "custom":
				props.lang = null;
				break;

			case "javascript":
				props.lang = javascript();
				$.set(value, javascriptValue(), true);
				break;

			case "typescript":
				props.lang = javascript({ typescript: true });
				$.set(value, typescriptValue(), true);
				break;

			case "html":
				props.lang = html({ matchClosingTags: true });
				$.set(value, htmlValue(), true);
				break;

			case "css":
				props.lang = css();
				$.set(value, cssValue(), true);
				break;
		}
	}

	function on_theme_change() {
		switch ($.get(theme)) {
			case "default":
				props.theme = null;
				break;

			case "onedark":
				props.theme = oneDark;
				break;
		}
	}

	var div = root_1();
	var node = $.child(div);

	CodeMirror(node, $.spread_props({ class: 'editor' }, () => props, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	}));

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var input_1 = $.child(div_4);

	$.remove_input_defaults(input_1);
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var input_2 = $.child(div_5);

	$.remove_input_defaults(input_2);
	$.next(2);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var input_3 = $.child(div_6);

	$.remove_input_defaults(input_3);
	$.next(2);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var input_4 = $.child(div_7);

	$.remove_input_defaults(input_4);
	$.next(2);
	$.reset(div_7);
	$.reset(div_2);

	var div_8 = $.sibling(div_2, 2);
	var div_9 = $.child(div_8);
	var input_5 = $.child(div_9);

	$.remove_input_defaults(input_5);
	$.next(2);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var input_6 = $.child(div_10);

	$.remove_input_defaults(input_6);
	$.next(2);
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var input_7 = $.child(div_11);

	$.remove_input_defaults(input_7);
	$.next(2);
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var input_8 = $.child(div_12);

	$.remove_input_defaults(input_8);
	$.next(2);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var input_9 = $.child(div_13);

	$.remove_input_defaults(input_9);
	$.next(2);
	$.reset(div_13);
	$.reset(div_8);

	var div_14 = $.sibling(div_8, 2);
	var div_15 = $.child(div_14);
	var input_10 = $.child(div_15);

	$.remove_input_defaults(input_10);
	$.next(2);
	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var input_11 = $.child(div_16);

	$.remove_input_defaults(input_11);
	$.next(2);
	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var input_12 = $.child(div_17);

	$.remove_input_defaults(input_12);
	$.next(2);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var input_13 = $.child(div_18);

	$.remove_input_defaults(input_13);
	$.next(2);
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var input_14 = $.child(div_19);

	$.remove_input_defaults(input_14);
	$.next(2);
	$.reset(div_19);
	$.reset(div_14);

	var div_20 = $.sibling(div_14, 2);
	var div_21 = $.child(div_20);
	var input_15 = $.child(div_21);

	$.remove_input_defaults(input_15);
	$.next(2);
	$.reset(div_21);

	var div_22 = $.sibling(div_21, 2);
	var input_16 = $.child(div_22);

	$.remove_input_defaults(input_16);
	$.next(2);
	$.reset(div_22);
	$.reset(div_20);

	var div_23 = $.sibling(div_20, 4);
	var div_24 = $.child(div_23);
	var input_17 = $.child(div_24);

	$.remove_input_defaults(input_17);
	$.next(2);
	$.reset(div_24);

	var div_25 = $.sibling(div_24, 2);
	var input_18 = $.sibling($.child(div_25), 2);

	$.remove_input_defaults(input_18);
	$.reset(div_25);
	$.reset(div_23);

	var div_26 = $.sibling(div_23, 4);
	var div_27 = $.child(div_26);
	var select = $.sibling($.child(div_27), 2);

	$.each(select, 20, () => languages, (lang) => lang, ($$anchor, lang) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, lang);

			if (option_value !== (option_value = lang)) {
				option.__value = option_value;
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(div_27);
	$.reset(div_26);

	var div_28 = $.sibling(div_26, 4);
	var div_29 = $.child(div_28);
	var select_1 = $.sibling($.child(div_29), 2);

	$.each(select_1, 20, () => themes, (thm) => thm, ($$anchor, thm) => {
		var option_1 = root();
		var text_1 = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text_1, thm);

			if (option_1_value !== (option_1_value = thm)) {
				option_1.__value = option_1_value;
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select_1);
	$.init_select(select_1);
	$.reset(div_29);
	$.reset(div_28);
	$.reset(div_1);
	$.reset(div);
	$.bind_checked(input, () => props.allowMultiSelect, ($$value) => props.allowMultiSelect = $$value);
	$.bind_checked(input_1, () => props.editable, ($$value) => props.editable = $$value);
	$.bind_checked(input_2, () => props.readonly, ($$value) => props.readonly = $$value);
	$.bind_checked(input_3, () => props.lineWrapping, ($$value) => props.lineWrapping = $$value);
	$.bind_checked(input_4, () => props.nodebounce, ($$value) => props.nodebounce = $$value);
	$.bind_checked(input_5, () => props.lineNumbers, ($$value) => props.lineNumbers = $$value);
	$.bind_checked(input_6, () => props.history, ($$value) => props.history = $$value);
	$.bind_checked(input_7, () => props.foldGutter, ($$value) => props.foldGutter = $$value);
	$.bind_checked(input_8, () => props.drawSelection, ($$value) => props.drawSelection = $$value);
	$.bind_checked(input_9, () => props.dropCursor, ($$value) => props.dropCursor = $$value);
	$.bind_checked(input_10, () => props.indentOnInput, ($$value) => props.indentOnInput = $$value);
	$.bind_checked(input_11, () => props.syntaxHighlighting, ($$value) => props.syntaxHighlighting = $$value);
	$.bind_checked(input_12, () => props.bracketMatching, ($$value) => props.bracketMatching = $$value);
	$.bind_checked(input_13, () => props.closeBrackets, ($$value) => props.closeBrackets = $$value);
	$.bind_checked(input_14, () => props.autocompletion, ($$value) => props.autocompletion = $$value);
	$.bind_checked(input_15, () => props.rectangularSelection, ($$value) => props.rectangularSelection = $$value);
	$.bind_checked(input_16, () => props.crosshairCursor, ($$value) => props.crosshairCursor = $$value);
	$.bind_checked(input_17, () => props.useTab, ($$value) => props.useTab = $$value);
	$.bind_value(input_18, () => props.tabSize, ($$value) => props.tabSize = $$value);
	$.delegated('change', select, on_language_change);
	$.bind_select_value(select, () => $.get(language), ($$value) => $.set(language, $$value));
	$.delegated('change', select_1, on_theme_change);
	$.bind_select_value(select_1, () => $.get(theme), ($$value) => $.set(theme, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);