import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="badge text-sm svelte-1ivuhw7"><!></span>`);

export default function Badge($$anchor, $$props) {
	var /**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	span = root();

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.append($$anchor, span);
}