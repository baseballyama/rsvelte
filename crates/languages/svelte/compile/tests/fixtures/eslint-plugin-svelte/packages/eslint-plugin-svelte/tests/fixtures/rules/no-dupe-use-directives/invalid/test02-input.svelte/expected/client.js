import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Test02_input($$anchor) {
	function x() {}

	var div = root();

	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.action(div, ($$node) => x?.($$node));
	$.append($$anchor, div);
}