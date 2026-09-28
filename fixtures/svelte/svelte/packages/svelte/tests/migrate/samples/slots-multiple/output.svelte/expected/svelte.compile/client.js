import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><!></button> <button><!></button>`, 1);

export default function Output($$anchor, $$props) {
	var fragment = root();

	var /**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	button = $.first_child(fragment);

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_1 = $.child(button_1);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(button_1);
	$.append($$anchor, fragment);
}