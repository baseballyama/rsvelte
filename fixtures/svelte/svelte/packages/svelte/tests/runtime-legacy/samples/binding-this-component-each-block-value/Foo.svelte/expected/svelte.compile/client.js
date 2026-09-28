import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>foo</div>`);

export default function Foo($$anchor, $$props) {
	$.push($$props, true);

	const test = true;
	var $$exports = { test };
	var div = root();

	$.append($$anchor, div);

	return $.pop($$exports);
}