import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function In_out_test_output($$anchor) {
	function a() {}
	function b() {}

	var div = root();

	$.transition(1, div, () => b);
	$.transition(2, div, () => a);
	$.append($$anchor, div);
}