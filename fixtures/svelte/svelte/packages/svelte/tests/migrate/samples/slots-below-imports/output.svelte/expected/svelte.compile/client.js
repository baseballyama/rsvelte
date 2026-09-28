import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Output($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */ (
	Foo)(node_1, {});

	$.append($$anchor, fragment);
}