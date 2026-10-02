import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import { createDebouncer } from '../../utils';
import { highlightedElement, mod_key_held } from '../../stores/app/misc';
import { basicSetup } from 'codemirror';
import { EditorView, keymap, ViewPlugin, Decoration } from '@codemirror/view';
import { standardKeymap, indentWithTab } from '@codemirror/commands';
import { EditorState, Compartment } from '@codemirror/state';
import { autocompletion } from '@codemirror/autocomplete';
import { vsCodeDark } from './theme';
import Icon from '@iconify/svelte';
import { svelteCompletions, cssCompletions } from './extensions/autocomplete';
import { getLanguage } from './extensions';
import highlight_active_line from './extensions/inspector';
import { emmetExtension, expandAbbreviation } from './extensions/emmet';
import prettier from 'prettier';
import * as prettierPostcss from 'prettier/plugins/postcss';
import * as prettierBabel from 'prettier/plugins/babel';
import * as prettierEstree from 'prettier/plugins/estree';
import * as prettierSvelte from 'prettier-plugin-svelte/browser';

import {
	get_word_at_pos,
	is_in_class_attr,
	get_styled_classes,
	extract_styles_for_class,
	get_rule_properties,
	flatten_rules
} from './css-utils.js';

const scrollPositions = new Map();
var root = $.from_html(`<div class="format-hint svelte-1xsoe9b"><span>&#8984;</span> <span>↵</span> <span>Format</span></div>`);
var root_1 = $.from_html(`<div class="tooltip-rule svelte-1xsoe9b"><button class="tooltip-rule-header svelte-1xsoe9b"><span class="tooltip-rule-selector svelte-1xsoe9b"> </span></button> <div class="tooltip-rule-editor svelte-1xsoe9b"></div></div>`);
var root_2 = $.from_html(`<div class="tooltip-rules-container svelte-1xsoe9b"></div>`);
var root_3 = $.from_html(`<div class="tooltip-empty svelte-1xsoe9b"> </div>`);
var root_4 = $.from_html(`<div class="class-tooltip svelte-1xsoe9b"><button class="tooltip-close-btn svelte-1xsoe9b">×</button> <!></div>`);
var root_5 = $.from_html(`<div><div class="editor-wrapper svelte-1xsoe9b"><div></div> <!> <!></div></div>`);

export default function CodeMirror($$anchor, $$props) {
	$.push($$props, true);

	const $highlightedElement = () => $.store_get(highlightedElement, '$highlightedElement', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const slowDebounce = createDebouncer(1000);

	// Class style tooltip state
	let tooltip_visible = $.state(false);

	let tooltip_x = $.state(0);
	let tooltip_y = $.state(0);
	let tooltip_class = $.state('');
	let tooltip_editable = $.state(false);
	let tooltip_rules = $.state($.proxy([]));
	let tooltip_editor_views = $.state($.proxy([] // Array of {element, view, rule}
	));
	let tooltip_save_timeout = $.state(null);

	function hide_tooltip() {
		if ($.get(tooltip_save_timeout)) {
			clearTimeout($.get(tooltip_save_timeout));
			$.set(tooltip_save_timeout, null);
		}

		for (const ev of $.get(tooltip_editor_views)) {
			if (ev.view) ev.view.destroy();
		}

		$.set(tooltip_editor_views, [], true);
		$.set(tooltip_visible, false);
		$.set(tooltip_editable, false);
	}

	function goto_rule(rule) {
		if (!$.get(Editor)) return;

		const doc = $.get(Editor).state.doc.toString();
		const selector = rule.original.selector;
		const selector_escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const pattern = new RegExp(selector_escaped + '\\s*\\{');
		const match = doc.match(pattern);

		if (match && match.index !== undefined) {
			const pos = match.index;

			$.get(Editor).dispatch({
				selection: { anchor: pos, head: pos + selector.length },
				scrollIntoView: true
			});

			$.get(Editor).focus();
			hide_tooltip();
		}
	}

	function debounced_tooltip_save() {
		if ($.get(tooltip_save_timeout)) clearTimeout($.get(tooltip_save_timeout));

		$.set(
			tooltip_save_timeout,
			setTimeout(
				() => {
					save_tooltip_styles_silent();
				},
				500
			),
			true
		);
	}

	function save_tooltip_styles_silent() {
		if (!$.get(Editor) || !$.get(tooltip_editor_views).length) return;

		let doc = $.get(Editor).state.doc.toString();

		try {
			// Process rules in reverse order (deepest nested first) to avoid position invalidation
			const views_reversed = [...$.get(tooltip_editor_views)].reverse();

			for (const ev of views_reversed) {
				if (!ev.view || !ev.rule) continue;

				const new_props = ev.view.state.doc.toString().trim();
				const selector = ev.rule.original.selector;

				// Find the original rule by its selector
				const selector_escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

				const rule_pattern = new RegExp(selector_escaped + '\\s*\\{', 'g');
				const match = rule_pattern.exec(doc);

				if (match) {
					const brace_start = doc.indexOf('{', match.index);

					// Find where body ends (before nested rules or closing brace)
					let body_end = brace_start + 1;

					let depth = 1;
					let found_nested = false;
					let nested_brace_pos = -1;

					// Scan for the body content end (stops at nested { or final })
					for (let i = brace_start + 1; i < doc.length && depth > 0; i++) {
						if (doc[i] === '{') {
							if (!found_nested) {
								nested_brace_pos = i;
								found_nested = true;
							}

							depth++;
						} else if (doc[i] === '}') {
							depth--;

							if (depth === 0 && !found_nested) {
								body_end = i;
							}
						}
					}

					// If we found a nested rule, scan back to find where its selector starts
					if (found_nested && nested_brace_pos > 0) {
						// Find the last semicolon or opening brace before the nested selector
						let selector_start = nested_brace_pos;

						for (let i = nested_brace_pos - 1; i > brace_start; i--) {
							if (doc[i] === ';' || doc[i] === '{') {
								selector_start = i + 1;

								break;
							}
						}

						// Skip whitespace after ; or {
						while (selector_start < nested_brace_pos && (/\s/).test(doc[selector_start])) {
							selector_start++;
						}

						// Go back to include the newline before selector
						const newline_before = doc.lastIndexOf('\n', selector_start - 1);

						if (newline_before > brace_start) {
							body_end = newline_before;
						} else {
							body_end = selector_start;
						}
					}

					// Get original indentation
					const line_start = doc.lastIndexOf('\n', match.index) + 1;

					const original_line = doc.slice(line_start, match.index);
					const base_indent = original_line.match(/^\s*/)?.[0] || '';
					const prop_indent = base_indent + '  ';

					// Format new properties with proper indentation
					const formatted_props = new_props.split('\n').filter((p) => p.trim()).map((p) => `${prop_indent}${p.trim()}`).join('\n');

					const replacement = `\n${formatted_props}`;

					doc = doc.slice(0, brace_start + 1) + replacement + doc.slice(body_end);
				}
			}

			$.get(Editor).dispatch({
				changes: { from: 0, to: $.get(Editor).state.doc.length, insert: doc }
			});
		} catch(e) {
			console.warn('CSS save error:', e);
		}
	}

	function show_class_tooltip(event, view) {
		const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });

		if (pos === null) return;

		const doc = view.state.doc.toString();
		const word_info = get_word_at_pos(doc, pos);

		if (!word_info) return;
		if (!is_in_class_attr(doc, pos)) return;

		// Cleanup existing editors
		for (const ev of $.get(tooltip_editor_views)) {
			if (ev.view) ev.view.destroy();
		}

		$.set(tooltip_editor_views, [], true);

		if ($.get(tooltip_save_timeout)) {
			clearTimeout($.get(tooltip_save_timeout));
			$.set(tooltip_save_timeout, null);
		}

		const rules = extract_styles_for_class(doc, word_info.word);
		const flat_rules = flatten_rules(rules);

		$.set(tooltip_class, word_info.word, true);
		$.set(tooltip_rules, flat_rules, true);
		$.set(tooltip_editable, flat_rules.length > 0);

		const editor_rect = $.get(element).getBoundingClientRect();
		const tooltip_width = 320;
		const tooltip_height = 280;

		// Account for scroll offset
		let x = event.clientX - editor_rect.left + $.get(element).scrollLeft + 10;

		let y = event.clientY - editor_rect.top + $.get(element).scrollTop + 10;

		if (event.clientX + tooltip_width + 20 > window.innerWidth) {
			x = event.clientX - editor_rect.left + $.get(element).scrollLeft - tooltip_width - 10;
		}

		if (event.clientY + tooltip_height + 20 > window.innerHeight) {
			y = event.clientY - editor_rect.top + $.get(element).scrollTop - tooltip_height - 10;
		}

		$.set(tooltip_x, Math.max(10, x), true);
		$.set(tooltip_y, Math.max(10 + $.get(element).scrollTop, y), true);
		$.set(tooltip_visible, true);

		if ($.get(tooltip_editable)) {
			requestAnimationFrame(() => {
				init_tooltip_editors();
			});
		}
	}

	function create_rule_editor(container, rule, index) {
		if (!container) return null;

		const props = get_rule_properties(rule.original);

		// Simple highlighter for CSS properties (property: value;)
		const prop_mark = Decoration.mark({ class: 'cm-css-property' });

		const value_mark = Decoration.mark({ class: 'cm-css-value' });

		function create_css_decorations(v) {
			const decorations = [];
			const doc = v.state.doc;
			const text = doc.toString();

			// Match property: value patterns
			const pattern = /([a-z-]+)\s*:\s*([^;]+);?/gi;

			let match;

			while ((match = pattern.exec(text)) !== null) {
				const prop_start = match.index;
				const prop_end = prop_start + match[1].length;
				const colon_pos = text.indexOf(':', prop_end);
				const value_start = colon_pos + 1;

				// Skip whitespace after colon
				let actual_value_start = value_start;

				while (actual_value_start < text.length && (/\s/).test(text[actual_value_start])) actual_value_start++;

				const value_end = match.index + match[0].length - (match[0].endsWith(';') ? 1 : 0);

				decorations.push(prop_mark.range(prop_start, prop_end));

				if (actual_value_start < value_end) {
					decorations.push(value_mark.range(actual_value_start, value_end));
				}
			}

			return Decoration.set(decorations.sort((a, b) => a.from - b.from));
		}

		const css_highlighter = ViewPlugin.fromClass(
			class {
				constructor(v) {
					this.decorations = create_css_decorations(v);
				}

				update(update) {
					if (update.docChanged) this.decorations = create_css_decorations(update.view);
				}
			},
			{ decorations: (v) => v.decorations }
		);

		const view = new EditorView({
			state: EditorState.create({
				doc: props,
				extensions: [
					basicSetup,
					css_highlighter,
					vsCodeDark,
					EditorView.theme({
						'&': { fontSize: '12px' },
						'.cm-scroller': { overflow: 'auto', fontFamily: 'Fira Code, monospace' },
						'.cm-content': { padding: '6px 8px' },
						'.cm-gutters': { display: 'none' },
						'.cm-lineNumbers': { display: 'none' },
						'.cm-activeLine': { backgroundColor: 'transparent !important' },
						'.cm-activeLineGutter': { backgroundColor: 'transparent !important' },
						'.cm-css-property': { color: 'rgb(156, 220, 254)' },
						'.cm-css-value': { color: 'rgb(206, 145, 120)' }
					}),

					EditorView.updateListener.of((update) => {
						if (update.docChanged) debounced_tooltip_save();
					})
				]
			}),
			parent: container
		});

		return { view, rule, index };
	}

	function init_tooltip_editors() {
		// Cleanup old views
		for (const ev of $.get(tooltip_editor_views)) {
			if (ev.view) ev.view.destroy();
		}

		$.set(tooltip_editor_views, [], true);

		// Create new editors for each rule
		const containers = document.querySelectorAll('.tooltip-rule-editor');

		containers.forEach((container, i) => {
			if ($.get(tooltip_rules)[i]) {
				const ev = create_rule_editor(container, $.get(tooltip_rules)[i], i);

				if (ev) $.get(tooltip_editor_views).push(ev);
			}
		});
	}

	/**
	 * @typedef {Object} Props
	 * @property {any} [data]
	 * @property {string} [prefix]
	 * @property {string} [value]
	 * @property {string} [mode]
	 * @property {string} [style]
	 * @property {boolean} [debounce]
	 * @property {number} [selection]
	 * @property {boolean} [disabled]
	 */
	/** @type {Props} */
	let data = $.prop($$props, 'data', 19, () => ({})),
		prefix = $.prop($$props, 'prefix', 3, ''),
		value = $.prop($$props, 'value', 15, ''),
		mode = $.prop($$props, 'mode', 3, 'html'),
		style = $.prop($$props, 'style', 3, ''),
		debounce = $.prop($$props, 'debounce', 3, false),
		selection = $.prop($$props, 'selection', 15, 0),
		disabled = $.prop($$props, 'disabled', 3, false);

	const dispatch = createEventDispatcher();
	let Editor = $.state(void 0);
	let is_focused = $.state(false);

	const detectModKey = EditorView.domEventHandlers({
		keydown(event, view) {
			if (event.metaKey) {
				dispatch('modkeydown');

				return false;
			}

			return false;
		},

		keyup(event, view) {
			if (!event.metaKey) {
				dispatch('modkeyup');

				return false;
			}

			return false;
		},

		focus(event, view) {
			$.set(is_focused, true);

			return false;
		},

		blur(event, view) {
			$.set(is_focused, false);

			return false;
		},

		contextmenu(event, view) {
			// Check if we're on a class name before preventing default
			const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });

			if (pos !== null) {
				const doc = view.state.doc.toString();
				const word_info = get_word_at_pos(doc, pos);

				if (word_info && is_in_class_attr(doc, pos)) {
					event.preventDefault();
					show_class_tooltip(event, view);

					return true;
				}
			}

			return false;
		},

		click(event, view) {
			hide_tooltip();

			return false;
		}
	});

	$.user_effect(() => {
		if ($.get(Editor) && value() !== $.get(Editor).state.doc.toString()) {
			const old_value = $.get(Editor).state.doc.toString();

			$.get(Editor).dispatch({
				changes: [{ from: 0, to: old_value.length, insert: value() }],
				selection: { anchor: 0 }
			});
		}
	});

	const language = getLanguage(mode());
	const css_completions_compartment = new Compartment();
	const svelte_completions_compartment = new Compartment();
	let css_variables = $.proxy([]);

	// Decoration for classes that have styles defined (underline them)
	const styled_class_mark = Decoration.mark({ class: 'cm-styled-class' });

	function create_styled_class_decorations(view) {
		const decorations = [];
		const doc = view.state.doc.toString();
		const styled_classes = get_styled_classes(doc);

		if (styled_classes.size === 0) return Decoration.set([]);

		// Find all class attributes and underline classes that have styles
		const class_attr_pattern = /class\s*=\s*["']([^"']+)["']/gi;

		let match;

		while ((match = class_attr_pattern.exec(doc)) !== null) {
			const classes_str = match[1];
			const attr_start = match.index + match[0].indexOf(match[1]);

			// Find each class name within the attribute
			let pos = 0;

			for (const class_name of classes_str.split(/\s+/)) {
				if (!class_name) {
					pos++;

					continue;
				}

				const class_start = classes_str.indexOf(class_name, pos);

				if (class_start >= 0 && styled_classes.has(class_name)) {
					const from = attr_start + class_start;
					const to = from + class_name.length;

					decorations.push(styled_class_mark.range(from, to));
				}

				pos = class_start + class_name.length;
			}
		}

		return Decoration.set(decorations.sort((a, b) => a.from - b.from));
	}

	const styled_class_highlighter = ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = create_styled_class_decorations(view);
			}

			update(update) {
				if (update.docChanged) this.decorations = create_styled_class_decorations(update.view);
			}
		},
		{ decorations: (v) => v.decorations }
	);

	const editor_state = EditorState.create({
		selection: { anchor: selection() },
		doc: value(),
		extensions: [
			EditorState.readOnly.of(disabled()),
			language,
			vsCodeDark,
			keymap.of([
				...standardKeymap,
				...mode() !== 'javascript' ? [{ key: 'Tab', run: expandAbbreviation }] : [],
				indentWithTab,
				{
					key: 'Escape',
					run: () => {
						$.get(Editor).contentDOM.blur();

						return true;
					}
				},

				{
					key: 'mod-e',
					run: () => {
						dispatch('mod-e');

						return true;
					}
				},

				{
					key: 'mod-r',
					run: () => {
						dispatch('mod-r');

						return true;
					}
				},

				{
					key: 'mod-1',
					run: () => {
						dispatch('tab-switch', 0);

						return true;
					}
				},

				{
					key: 'mod-2',
					run: () => {
						dispatch('tab-switch', 1);

						return true;
					}
				},

				{
					key: 'mod-3',
					run: () => {
						dispatch('tab-switch', 2);

						return true;
					}
				},

				{
					key: 'mod-s',
					run: () => {
						dispatch('save');

						return true;
					}
				},

				{
					key: 'mod-r',
					run: () => {
						dispatch('refresh');

						return true;
					}
				},

				{
					key: 'mod-Enter',
					run: () => {
						const value = $.get(Editor).state.doc.toString();
						const position = $.get(Editor).state.selection.main.head;

						format_code(value, { mode: mode(), position }).then((res) => {
							if (!res) return;

							const { formatted, cursorOffset } = res;

							$.get(Editor).dispatch({
								changes: [
									{
										from: 0,
										to: $.get(Editor).state.doc.length,
										insert: formatted
									}
								],
								selection: { anchor: cursorOffset }
							});

							dispatchChanges(formatted);
						});

						return true;
					}
				}
			]),
			detectModKey,
			EditorView.updateListener.of((view) => {
				if (view.docChanged) {
					const newValue = view.state.doc.toString();

					value(newValue.replace(prefix(), ''));

					if (debounce()) {
						slowDebounce([dispatchChanges, value()]);
					} else {
						dispatchChanges(value());
					}
				}

				selection(view.state.selection.main.from);
			}),
			basicSetup,
			...mode() === 'html'
				? [
					svelte_completions_compartment.of(autocompletion({ override: [svelteCompletions($$props.completions)] })),
					styled_class_highlighter
				]
				: [],

			...mode() === 'css'
				? [
					css_completions_compartment.of(cssCompletions(css_variables))
				]
				: [],

			...mode() !== 'javascript'
				? [emmetExtension(mode() === 'css' ? 'css' : 'html')]
				: []
		]
	});

	$.user_effect(() => {
		mode() === 'css' && $.get(Editor) && $.get(Editor).dispatch({
			effects: css_completions_compartment.reconfigure(cssCompletions(css_variables))
		});
	});

	$.user_effect(() => {
		mode() === 'html' && $.get(Editor) && $.get(Editor).dispatch({
			effects: svelte_completions_compartment.reconfigure(autocompletion({ override: [svelteCompletions($$props.completions)] }))
		});
	});

	$.user_effect(() => {
		mode() === 'html' && $.get(Editor) && highlight_active_line($.get(Editor), $highlightedElement());
	});

	async function format_code(code, { mode, position }) {
		let formatted;

		try {
			if (mode === 'javascript') {
				mode = 'babel';
			} else if (mode === 'html') {
				mode = 'svelte';
			}

			formatted = prettier.formatWithCursor(code, {
				parser: mode,
				bracketSameLine: true,
				cursorOffset: position,
				plugins: [
					prettierSvelte,
					prettierPostcss,
					prettierBabel,
					prettierEstree
				]
			});
		} catch(e) {
			console.warn(e);
		}

		return formatted;
	}

	let editorNode = $.state(void 0);

	$.user_effect(() => {
		if ($.get(editorNode)) {
			$.set(Editor, new EditorView({ state: editor_state, parent: $.get(editorNode) }), true);
		}
	});

	function dispatchChanges(value) {
		dispatch('change', value);
	}

	let element = $.state(void 0);

	$.user_effect(() => {
		if ($.get(element)) {
			if (scrollPositions.has(value())) {
				$.get(element).scrollTo(0, scrollPositions.get(value()));
			}

			$.get(element).addEventListener('scroll', () => {
				scrollPositions.set(value(), $.get(element).scrollTop);
			});
		}
	});

	var // Editor.setSize(null, editorNode.clientHeight)
	div = root_5();

	$.event('resize', $.window, () => {
		// Editor.setSize(null, editorNode.clientHeight)
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.bind_this(div_2, ($$value) => $.set(editorNode, $$value), () => $.get(editorNode));

	var node = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();

			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($mod_key_held() && $.get(is_focused)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_4 = root_4();
			var button = $.child(div_4);
			var node_2 = $.sibling(button, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_5 = root_2();

					$.each(div_5, 21, () => $.get(tooltip_rules), $.index, ($$anchor, rule) => {
						var div_6 = root_1();
						var button_1 = $.child(div_6);
						var span = $.child(button_1);
						var text_1 = $.only_child(span, true);

						$.reset(button_1);
						$.next(2);
						$.reset(div_6);
						$.template_effect(() => $.set_text(text_1, $.get(rule).selector));
						$.delegated('click', button_1, () => goto_rule($.get(rule)));
						$.append($$anchor, div_6);
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var alternate = ($$anchor) => {
					var div_7 = root_3();
					var text_2 = $.only_child(div_7);

					$.template_effect(() => $.set_text(text_2, `No styles found for .${$.get(tooltip_class) ?? ''}`));
					$.append($$anchor, div_7);
				};

				$.if(node_2, ($$render) => {
					if ($.get(tooltip_editable)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(div_4);
			$.template_effect(() => $.set_style(div_4, `left: ${$.get(tooltip_x) ?? ''}px; top: ${$.get(tooltip_y) ?? ''}px;`));
			$.delegated('click', div_4, (e) => e.stopPropagation());
			$.delegated('click', button, hide_tooltip);
			$.transition(3, div_4, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div_4);
		};

		$.if(node_1, ($$render) => {
			if ($.get(tooltip_visible)) $$render(consequent_2);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));

	$.template_effect(() => {
		$.set_class(div, 1, `codemirror-container ${mode() ?? ''}`, 'svelte-1xsoe9b');
		$.set_style(div, style());
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);