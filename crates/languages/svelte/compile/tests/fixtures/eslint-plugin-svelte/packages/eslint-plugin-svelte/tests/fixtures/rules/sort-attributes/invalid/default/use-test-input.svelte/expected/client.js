import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Use_test_input($$anchor) {
	function a() {}
	function b() {}

	var div = root();

	$.action(div, ($$node) => b?.($$node));
	$.action(div, ($$node) => a?.($$node));
	$.append($$anchor, div);
}