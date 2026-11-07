import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Use_test_output($$anchor) {
	function a() {}
	function b() {}

	var div = root();

	$.action(div, ($$node) => a?.($$node));
	$.action(div, ($$node) => b?.($$node));
	$.append($$anchor, div);
}