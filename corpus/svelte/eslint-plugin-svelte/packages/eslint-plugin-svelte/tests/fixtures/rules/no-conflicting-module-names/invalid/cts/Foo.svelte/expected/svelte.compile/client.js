import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>cts</p>`);

export default function Foo($$anchor) {
	var p = root();

	$.append($$anchor, p);
}