import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	/**
	 * @typedef {object} Props
	 * @property {import('svelte').Snippet} [children] - The children of the layout
	 */
	/** @type {Props} */
}