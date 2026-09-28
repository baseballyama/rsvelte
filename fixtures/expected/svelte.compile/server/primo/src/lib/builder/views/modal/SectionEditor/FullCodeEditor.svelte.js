import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import CodeMirror from '$lib/builder/components/CodeEditor/CodeMirror.svelte';

export default function FullCodeEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		let {
			data = {},
			completions,
			html = '',
			css = '',
			js = '',
			storage_key,
			onmod_e = () => {},
			onmod_r = () => {},
			oninput = () => {}
		} = $$props;

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
		let unified_code = merge_code(html, css, js);

		// Track if we're currently syncing to avoid loops
		let syncing = false;

		// When unified code changes, parse and update html/css/js
		function handle_code_change() {
			if (syncing) return;

			syncing = true;

			const parsed = parse_code(unified_code);

			html = parsed.html;
			css = parsed.css;
			js = parsed.js;
			dispatch('htmlChange');
			dispatch('cssChange');
			dispatch('jsChange');
			oninput();
			syncing = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="editor-container svelte-9apz4g">`);

			CodeMirror($$renderer, {
				mode: 'html',
				data,
				completions,
				get value() {
					return unified_code;
				},

				set value($$value) {
					unified_code = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { html, css, js });
	});
}