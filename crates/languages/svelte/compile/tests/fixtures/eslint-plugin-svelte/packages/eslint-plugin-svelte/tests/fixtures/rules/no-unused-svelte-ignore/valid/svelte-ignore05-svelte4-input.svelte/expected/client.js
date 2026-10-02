import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function Svelte_ignore05_svelte4_input($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.key(node, () => 42, ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
}