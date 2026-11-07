import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function _2_input($$anchor) {
	function foo(node) {
		// the node has been mounted in the DOM
		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}

	var div = root();

	$.action(div, ($$node) => foo?.($$node));
	$.append($$anchor, div);
}