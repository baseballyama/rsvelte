import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function In_out_test_input($$anchor) {
	function a() {}
	function b() {}

	var div = root();

	$.transition(2, div, () => a);
	$.transition(1, div, () => b);
	$.append($$anchor, div);
}