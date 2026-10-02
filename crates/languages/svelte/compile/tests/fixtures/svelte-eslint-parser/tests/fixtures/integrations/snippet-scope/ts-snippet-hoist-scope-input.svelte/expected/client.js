import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>Hello World!</p>`);

export default function Ts_snippet_hoist_scope_input($$anchor) {
	const bar = foo;

	bar($$anchor);
}