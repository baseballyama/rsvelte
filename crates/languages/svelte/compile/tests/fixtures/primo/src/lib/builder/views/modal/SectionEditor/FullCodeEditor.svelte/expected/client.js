import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import CodeMirror from '$lib/builder/components/CodeEditor/CodeMirror.svelte';

var root = $.from_html(`<div class="editor-container svelte-9apz4g"><!></div>`);

export default function FullCodeEditor($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	let data = $.prop($$props, 'data', 19, () => ({})),
		html = $.prop($$props, 'html', 15, ''),
		css = $.prop($$props, 'css', 15, ''),
		js = $.prop($$props, 'js', 15, ''),
		onmod_e = $.prop($$props, 'onmod_e', 3, () => {}),
		onmod_r = $.prop($$props, 'onmod_r', 3, () => {}),
		oninput = $.prop($$props, 'oninput', 3, () => {});

	// Combine html/css/js into a single unified code string
	// Order: JS, HTML, CSS
	function merge_code(html_val, css_val, js_val) {
		let parts = [];

		// Add script block if there's JS
		// Using array join to avoid confusing svelte preprocessor
		if (js_val && js_val.trim()) {
			parts.push(['<', 'script', '>\n', js_val, '\n</', 'script', '>'].join(''));
		}

		// Add HTML content
		if (html_val && html_val.trim()) {
			parts.push(html_val);
		}

		// Add style block if there's CSS
		if (css_val && css_val.trim()) {
			parts.push(['<', 'style', '>\n', css_val, '\n</', 'style', '>'].join(''));
		}

		return parts.join('\n\n');
	}

	// Parse unified code back into html/css/js
	// Using RegExp constructor to avoid confusing svelte preprocessor
	function parse_code(code) {
		let extracted_css = '';
		let extracted_js = '';
		let remaining_html = code;

		// Extract style content
		const style_pattern = new RegExp('<' + 'style[^>]*>([\\s\\S]*?)</' + 'style>', 'i');

		const style_match = code.match(style_pattern);

		if (style_match) {
			extracted_css = style_match[1].trim();
			remaining_html = remaining_html.replace(style_match[0], '');
		}

		// Extract script content (but not script src=...)
		const script_pattern = new RegExp('<' + 'script(?![^>]*\\bsrc\\s*=)[^>]*>([\\s\\S]*?)</' + 'script>', 'i');

		const script_match = remaining_html.match(script_pattern);

		if (script_match) {
			extracted_js = script_match[1].trim();
			remaining_html = remaining_html.replace(script_match[0], '');
		}

		// Clean up extra whitespace from HTML
		remaining_html = remaining_html.trim();

		return { html: remaining_html, css: extracted_css, js: extracted_js };
	}

	// Initialize unified code from props
	let unified_code = $.state($.proxy(merge_code(html(), css(), js())));

	// Track if we're currently syncing to avoid loops
	let syncing = false;

	// When unified code changes, parse and update html/css/js
	function handle_code_change() {
		if (syncing) return;

		syncing = true;

		const parsed = parse_code($.get(unified_code));

		html(parsed.html);
		css(parsed.css);
		js(parsed.js);
		dispatch('htmlChange');
		dispatch('cssChange');
		dispatch('jsChange');
		oninput()();
		syncing = false;
	}

	var div = root();
	var node = $.child(div);

	CodeMirror(node, {
		mode: 'html',
		get data() {
			return data();
		},

		get completions() {
			return $$props.completions;
		},

		get value() {
			return $.get(unified_code);
		},

		set value($$value) {
			$.set(unified_code, $$value, true);
		},

		$$events: {
			'mod-e': function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			'mod-r': function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},
			change: handle_code_change,
			save: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			refresh: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}