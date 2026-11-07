import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	/**
	 * @typedef {Object} Props
	 * @property {ShouldNotUseTSBecauseImUsingJsDoc} data
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
}